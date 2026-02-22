import { action } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
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
 * contentType must match the header the client sends when PUTting (e.g. blob.type or "image/png").
 */
export const getUploadUrl = action({
  args: {
    contentType: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<{ url: string; s3Key: string }> => {
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
    const contentType = args.contentType ?? "image/png";

    const client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: PRESIGNED_EXPIRY_SECONDS,
    });

    return { url, s3Key };
  },
});

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

/**
 * Confirm that an upload completed and record it in the uploads table.
 * Verifies the object exists in S3 before recording to avoid invalid DB entries.
 */
export const confirmUpload = action({
  args: {
    s3Key: v.string(),
    type: v.union(v.literal("user-photo"), v.literal("rendered-video")),
  },
  handler: async (ctx, { s3Key, type }) => {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing S3 env: S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
      );
    }

    const client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    try {
      await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: s3Key })
      );
    } catch {
      throw new Error(
        "Upload verification failed: object not found in S3. Only call confirmUpload after a successful PUT."
      );
    }

    await ctx.runMutation(internal.storage.confirmUploadRecord, { s3Key, type });
  },
});
