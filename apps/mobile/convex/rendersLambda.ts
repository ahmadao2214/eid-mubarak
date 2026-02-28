"use node";

import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import {
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda/client";
import type { AwsRegion } from "@remotion/lambda";

export const RENDER_CONFIG = {
  framesPerLambda: 300, // Render all frames in a single Lambda to avoid AWS concurrency limits
  pollIntervalMs: 2000, // was 3000 — faster status updates
  codec: "h264" as const,
};

/** Extract S3 key from our stored URL (https://bucket.s3.region.amazonaws.com/key). */
function extractS3KeyFromUrl(url: string | null | undefined): string | null {
  if (!url?.includes("amazonaws.com/")) return null;
  const after = url.split("amazonaws.com/")[1]?.split("?")[0];
  return after && (after.startsWith("user-photos/") || after.startsWith("rendered-videos/") || after.startsWith("heads/"))
    ? after
    : null;
}

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

    let compositionForLambda = project.composition;
    const headUrl = project.composition.head?.imageUrl;
    const s3Key = extractS3KeyFromUrl(headUrl);
    if (s3Key) {
      const { url: presignedUrl } = await ctx.runAction(api.storage.getDownloadUrl, {
        s3Key,
      });
      compositionForLambda = {
        ...project.composition,
        head: {
          ...project.composition.head,
          imageUrl: presignedUrl,
        },
      };
    }

    try {
      const result = await renderMediaOnLambda({
        region,
        functionName,
        serveUrl,
        composition: "EidMemeVideo",
        inputProps: compositionForLambda,
        codec: RENDER_CONFIG.codec,
        outName: `renders/${renderId}.mp4`,
        framesPerLambda: RENDER_CONFIG.framesPerLambda,
      });
      await ctx.scheduler.runAfter(
        RENDER_CONFIG.pollIntervalMs,
        internal.rendersLambda.pollRenderProgress,
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
        RENDER_CONFIG.pollIntervalMs,
        internal.rendersLambda.pollRenderProgress,
        args,
      );
    }
  },
});
