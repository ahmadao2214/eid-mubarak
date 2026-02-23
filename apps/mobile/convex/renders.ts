import { query, mutation, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda/client";
import type { AwsRegion } from "@remotion/lambda";

export const request = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const renderId = await ctx.db.insert("renders", {
      projectId: args.projectId,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.renders.executeRender, {
      renderId,
      projectId: args.projectId,
    });
    return renderId;
  },
});

export const getStatus = query({
  args: { renderId: v.id("renders") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.renderId);
    return doc ?? null;
  },
});

export const updateProgress = mutation({
  args: {
    renderId: v.id("renders"),
    progress: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("rendering"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    outputS3Url: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.renderId, {
      progress: args.progress,
      status: args.status,
      ...(args.outputS3Url !== undefined && { outputS3Url: args.outputS3Url }),
      ...(args.error !== undefined && { error: args.error }),
      ...(args.status === "completed" && { completedAt: Date.now() }),
    });
  },
});

const POLL_INTERVAL_MS = 3000;

export const internalUpdateProgress = internalMutation({
  args: {
    renderId: v.id("renders"),
    progress: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("rendering"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    outputS3Url: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.renderId, {
      progress: args.progress,
      status: args.status,
      ...(args.outputS3Url !== undefined && { outputS3Url: args.outputS3Url }),
      ...(args.error !== undefined && { error: args.error }),
      ...(args.status === "completed" && { completedAt: Date.now() }),
    });
  },
});

export const executeRender = internalAction({
  args: {
    renderId: v.id("renders"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, { renderId, projectId }) => {
    const functionName = process.env.REMOTION_FUNCTION_NAME;
    const serveUrl = process.env.REMOTION_SERVE_URL;
    const region = (process.env.REMOTION_REGION ?? "us-east-1") as AwsRegion;

    if (!functionName || !serveUrl) {
      await ctx.runMutation(internal.renders.internalUpdateProgress, {
        renderId,
        progress: 0,
        status: "failed",
        error: "Missing env: REMOTION_FUNCTION_NAME, REMOTION_SERVE_URL",
      });
      return;
    }

    const project = await ctx.runQuery(internal.projects.internalGet, {
      id: projectId,
    });
    if (!project) {
      await ctx.runMutation(internal.renders.internalUpdateProgress, {
        renderId,
        progress: 0,
        status: "failed",
        error: "Project not found",
      });
      return;
    }

    await ctx.runMutation(internal.renders.internalUpdateProgress, {
      renderId,
      progress: 0,
      status: "rendering",
    });

    try {
      const result = await renderMediaOnLambda({
        region,
        functionName,
        serveUrl,
        composition: "EidMemeVideo",
        inputProps: project.composition,
        codec: "h264",
        outName: `renders/${renderId}.mp4`,
      });
      await ctx.scheduler.runAfter(
        POLL_INTERVAL_MS,
        internal.renders.pollRenderProgress,
        {
          renderId,
          lambdaRenderId: result.renderId,
          bucketName: result.bucketName,
          functionName,
          region,
        },
      );
    } catch (err) {
      await ctx.runMutation(internal.renders.internalUpdateProgress, {
        renderId,
        progress: 0,
        status: "failed",
        error: err instanceof Error ? err.message : "Lambda render failed",
      });
    }
  },
});

export const pollRenderProgress = internalAction({
  args: {
    renderId: v.id("renders"),
    lambdaRenderId: v.string(),
    bucketName: v.string(),
    functionName: v.string(),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await getRenderProgress({
      renderId: args.lambdaRenderId,
      bucketName: args.bucketName,
      functionName: args.functionName,
      region: args.region as AwsRegion,
    });

    if (progress.done) {
      await ctx.runMutation(internal.renders.internalUpdateProgress, {
        renderId: args.renderId,
        progress: 100,
        status: "completed",
        outputS3Url: progress.outputFile ?? undefined,
      });
    } else if (progress.fatalErrorEncountered) {
      await ctx.runMutation(internal.renders.internalUpdateProgress, {
        renderId: args.renderId,
        progress: Math.round((progress.overallProgress ?? 0) * 100),
        status: "failed",
        error: progress.errors?.[0]?.message ?? "Render failed",
      });
    } else {
      await ctx.runMutation(internal.renders.internalUpdateProgress, {
        renderId: args.renderId,
        progress: Math.round((progress.overallProgress ?? 0) * 100),
        status: "rendering",
      });
      await ctx.scheduler.runAfter(
        POLL_INTERVAL_MS,
        internal.renders.pollRenderProgress,
        args,
      );
    }
  },
});
