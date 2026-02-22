import { action } from "./_generated/server";
import { v } from "convex/values";

// Upload functionality (getUploadUrl, confirmUpload) lives in storage.ts.
// This file only contains the remove-background stub.

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
