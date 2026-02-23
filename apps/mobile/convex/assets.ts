import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByType = query({
  args: {
    type: v.union(
      v.literal("background"),
      v.literal("lottie"),
      v.literal("celebrity_head"),
      v.literal("font"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const listCelebrityHeads = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_type", (q) => q.eq("type", "celebrity_head"))
      .collect();
  },
});

// Idempotent seed — skips if s3Key already exists
export const seed = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("background"),
      v.literal("lottie"),
      v.literal("celebrity_head"),
      v.literal("font"),
    ),
    s3Key: v.string(),
    s3Url: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("assets")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .filter((q) => q.eq(q.field("s3Key"), args.s3Key))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("assets", {
      name: args.name,
      type: args.type,
      s3Key: args.s3Key,
      s3Url: args.s3Url,
      tags: args.tags,
    });
  },
});
