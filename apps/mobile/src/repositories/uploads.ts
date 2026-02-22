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
  return await convexClient.action(api.uploads.removeBackground, {
    s3Key: imageUri,
  });
}
