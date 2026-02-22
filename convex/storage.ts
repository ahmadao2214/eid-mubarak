import { action } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const PRESIGNED_EXPIRY_SECONDS = 15 * 60; // 15 minutes

/**
 * Generate a unique S3 key for user uploads.
 */
function generateUploadKey(prefix: "user-photos" | "rendered-videos"): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const ext = prefix === "user-photos" ? "png" : "mp4";
  return `${prefix}/${suffix}.${ext}`;
}

/**
 * Get a presigned S3 PUT URL for uploading a file.
 * Returns both the URL and the s3Key so the client can call confirmUpload after uploading.
 */
export const getUploadUrl = action({
  args: {},
  handler: async (_ctx): Promise<{ url: string; s3Key: string }> => {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing S3 env: S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
      );
    }

    const s3Key = generateUploadKey("user-photos");

    const client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: PRESIGNED_EXPIRY_SECONDS,
    });

    return { url, s3Key };
  },
});

/**
 * Confirm that an upload completed and record it in the uploads table.
 * Call this after the client has PUT the file to the presigned URL.
 */
export const confirmUpload = mutation({
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
