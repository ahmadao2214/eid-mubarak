import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const request = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const renderId = await ctx.db.insert("renders", {
      projectId: args.projectId,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.rendersLambda.executeRender, {
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
