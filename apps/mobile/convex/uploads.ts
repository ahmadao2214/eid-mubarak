"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const PHOTOROOM_SEGMENT_URL = "https://sdk.photoroom.com/v1/segment";

const ALLOWED_S3_KEY_PREFIXES = ["user-photos/", "rendered-videos/"] as const;

function isAllowedS3Key(s3Key: string): boolean {
  return ALLOWED_S3_KEY_PREFIXES.some((prefix) => s3Key.startsWith(prefix));
}

/**
 * Fetch image from S3, remove background via PhotoRoom API, upload result to S3, return S3 key.
 * For local images (gallery/camera), use removeBackgroundAndUpload instead — do not call this with empty args.
 * Client should call storage.getDownloadUrl with the returned key for a presigned URL (bucket may be private).
 * Requires Convex env: S3_*, AWS_*, PHOTOROOM_API_KEY (or PHOTOROOM_SANDBOX_API_KEY for testing).
 */
export const removeBackground = action({
  args: { s3Key: v.optional(v.string()) },
  handler: async (_ctx, args): Promise<{ resultS3Key: string }> => {
    if (!args.s3Key || typeof args.s3Key !== "string" || !args.s3Key.trim()) {
      throw new Error(
        "removeBackground requires s3Key. For photos from gallery/camera use removeBackgroundAndUpload (sends image bytes, uploads only the result)."
      );
    }
    if (!isAllowedS3Key(args.s3Key)) {
      throw new Error(
        `s3Key must start with one of: ${ALLOWED_S3_KEY_PREFIXES.join(", ")}`
      );
    }
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const apiKey =
      process.env.PHOTOROOM_API_KEY ??
      process.env.PHOTOROOM_SANDBOX_API_KEY;

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing S3 env: S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
      );
    }
    if (!apiKey) {
      throw new Error(
        "Missing PhotoRoom env: set PHOTOROOM_API_KEY or PHOTOROOM_SANDBOX_API_KEY in Convex dashboard"
      );
    }

    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    // 1. Get image from S3
    const getCmd = new GetObjectCommand({ Bucket: bucket, Key: args.s3Key });
    const getRes = await s3.send(getCmd);
    const body = getRes.Body;
    if (!body) {
      throw new Error(`S3 object not found or empty: ${args.s3Key}`);
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const imageBuffer = Buffer.concat(chunks);

    // 2. Call PhotoRoom segment API (multipart form: image_file)
    const form = new FormData();
    const filename = args.s3Key.split("/").pop() ?? "image.png";
    form.append("image_file", new Blob([imageBuffer]), filename);

    const segmentRes = await fetch(PHOTOROOM_SEGMENT_URL, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: form,
    });

    if (!segmentRes.ok) {
      const text = await segmentRes.text();
      throw new Error(
        `PhotoRoom segment failed (${segmentRes.status}): ${text.slice(0, 500)}`
      );
    }

    const resultPng = new Uint8Array(await segmentRes.arrayBuffer());

    // 3. Upload result to S3 under user-photos/rembg/
    const resultKey = `user-photos/rembg/${Date.now()}-${Math.random().toString(36).slice(2, 11)}.png`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: resultKey,
        Body: resultPng,
        ContentType: "image/png",
      })
    );

    return { resultS3Key: resultKey };
  },
});

/**
 * Remove background from image bytes (base64), upload result to S3 only. No prior upload.
 * Client sends cropped/compressed image; we call PhotoRoom and upload only the transparent PNG.
 * Returns resultStableUrl so the app stores a non-expiring URL (presigned URLs expire and cause "photo no longer in S3").
 */
export const removeBackgroundAndUpload = action({
  args: {
    imageBase64: v.string(),
  },
  handler: async (_ctx, args): Promise<{ resultS3Key: string; resultStableUrl: string }> => {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const apiKey =
      process.env.PHOTOROOM_API_KEY ??
      process.env.PHOTOROOM_SANDBOX_API_KEY;

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing S3 env: S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
      );
    }
    if (!apiKey) {
      throw new Error(
        "Missing PhotoRoom env: set PHOTOROOM_API_KEY or PHOTOROOM_SANDBOX_API_KEY in Convex dashboard"
      );
    }

    const imageBuffer = Buffer.from(args.imageBase64, "base64");
    if (imageBuffer.length === 0) {
      throw new Error("imageBase64 is empty");
    }

    const form = new FormData();
    form.append("image_file", new Blob([imageBuffer]), "image.png");

    const segmentRes = await fetch(PHOTOROOM_SEGMENT_URL, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: form,
    });

    if (!segmentRes.ok) {
      const text = await segmentRes.text();
      throw new Error(
        `PhotoRoom segment failed (${segmentRes.status}): ${text.slice(0, 500)}`
      );
    }

    const resultPng = new Uint8Array(await segmentRes.arrayBuffer());
    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    const resultKey = `user-photos/rembg/${Date.now()}-${Math.random().toString(36).slice(2, 11)}.png`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: resultKey,
        Body: resultPng,
        ContentType: "image/png",
      })
    );

    const resultStableUrl = `https://${bucket}.s3.${region}.amazonaws.com/${resultKey}`;
    return { resultS3Key: resultKey, resultStableUrl };
  },
});
