import { action } from "./_generated/server";
import { v } from "convex/values";

// Stub — returns mock URLs until AWS credentials are configured in Convex env vars.
// Real S3 + remove.bg wired in Phase 5.

export const getPresignedUrl = action({
  args: {
    type: v.union(v.literal("user-photo"), v.literal("rendered-video")),
    contentType: v.string(),
  },
  handler: async (_ctx, args) => {
    const s3Key = `${args.type}s/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      url: `https://mock-s3.example.com/${s3Key}?presigned=true`,
      s3Key,
    };
  },
});

export const removeBackground = action({
  args: { s3Key: v.string() },
  handler: async (_ctx, args) => {
    // Stub — passthrough. Returns the same key with a -nobg suffix.
    const resultKey = args.s3Key.replace(/\.\w+$/, "-nobg.png");
    return {
      resultS3Url: `https://mock-s3.example.com/${resultKey}`,
    };
  },
});
