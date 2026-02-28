// @deprecated — Legacy repository layer; screens use useUpload hook instead.
// Kept for backward-compatible tests only.
import { convexClient, api } from "@/lib/convex";
import type { UploadUrlResponse, RemoveBgResponse } from "@/types";

export async function getUploadUrl(): Promise<UploadUrlResponse & { s3Key: string }> {
  const result = await convexClient.action(api.storage.getUploadUrl, {
    contentType: "image/png",
  });
  return { url: result.url, s3Key: result.s3Key };
}

export async function uploadToS3(
  presignedUrl: string,
  file: Blob | ArrayBuffer,
  s3Key: string,
): Promise<string> {
  await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": "image/png" },
  });
  return s3Key;
}

export async function removeBackground(
  imageUri: string,
): Promise<RemoveBgResponse> {
  const s3Key = typeof imageUri === "string" && imageUri.trim() ? imageUri.trim() : null;
  if (!s3Key) {
    throw new Error("removeBackground requires a valid S3 key (e.g. user-photos/...)");
  }
  const { resultS3Key } = await convexClient.action(api.uploads.removeBackground, {
    s3Key,
  });
  const { url } = await convexClient.action(api.storage.getDownloadUrl, {
    s3Key: resultS3Key,
  });
  return { resultS3Url: url };
}

/**
 * Remove background from image bytes (base64); Convex uploads only the result to S3.
 * Returns the stable S3 URL (not presigned) so it can be stored in the composition and resolved
 * for display/rendering without expiring. Presigned URLs expire and cause "photo no longer in S3".
 */
export async function removeBackgroundFromImage(
  imageBase64: string,
): Promise<RemoveBgResponse> {
  const trimmed = typeof imageBase64 === "string" ? imageBase64.trim() : "";
  if (!trimmed) {
    throw new Error("removeBackgroundFromImage requires a non-empty base64 string");
  }
  const { resultStableUrl } = await convexClient.action(
    api.uploads.removeBackgroundAndUpload,
    { imageBase64: trimmed },
  );
  return { resultS3Url: resultStableUrl };
}
