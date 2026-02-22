import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const request = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.insert("renders", {
      projectId: args.projectId,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
    });
  },
});

export const getStatus = query({
  args: { renderId: v.id("renders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.renderId);
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
    const updates: Record<string, unknown> = {
      progress: args.progress,
      status: args.status,
    };
    if (args.outputS3Url !== undefined) {
      updates.outputS3Url = args.outputS3Url;
    }
    if (args.error !== undefined) {
      updates.error = args.error;
    }
    if (args.status === "completed") {
      updates.completedAt = Date.now();
    }
    await ctx.db.patch(args.renderId, updates);
  },
});
