import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Internal mutation: record upload in DB. Only called by confirmUpload action after S3 verification.
 */
export const confirmUploadRecord = internalMutation({
  args: {
    s3Key: v.string(),
    type: v.union(v.literal("user-photo"), v.literal("rendered-video")),
  },
  handler: async (ctx, { s3Key, type }) => {
    await ctx.db.insert("uploads", {
      s3Key,
      type,
      createdAt: Date.now(),
    });
  },
});
