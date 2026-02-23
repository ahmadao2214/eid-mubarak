import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByCategory = query({
  args: {
    category: v.union(
      v.literal("nasheed"),
      v.literal("bollywood"),
      v.literal("voiceover"),
      v.literal("sfx"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sounds")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sounds").collect();
  },
});

// Idempotent seed — skips if s3Key already exists
export const seed = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal("nasheed"),
      v.literal("bollywood"),
      v.literal("voiceover"),
      v.literal("sfx"),
    ),
    duration: v.number(),
    s3Key: v.string(),
    s3Url: v.string(),
    attribution: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sounds")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("s3Key"), args.s3Key))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("sounds", {
      name: args.name,
      category: args.category,
      duration: args.duration,
      s3Key: args.s3Key,
      s3Url: args.s3Url,
      attribution: args.attribution,
      tags: args.tags,
    });
  },
});
