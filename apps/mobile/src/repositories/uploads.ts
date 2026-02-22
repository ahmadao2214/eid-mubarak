import { convexClient, api } from "@/lib/convex";
import type { UploadUrlResponse, RemoveBgResponse } from "@/types";

export async function getUploadUrl(): Promise<UploadUrlResponse> {
  const result = await convexClient.action(api.uploads.getPresignedUrl, {
    type: "user-photo",
    contentType: "image/png",
  });
  return { url: result.url };
}

export async function uploadToS3(
  presignedUrl: string,
  file: Blob | ArrayBuffer,
): Promise<string> {
  await fetch(presignedUrl, {
    method: "PUT",
    body: file,
  });
  // Return the presigned URL path as the S3 key
  const url = new URL(presignedUrl);
  return url.pathname.slice(1); // Remove leading /
}

export async function removeBackground(
  imageUri: string,
): Promise<RemoveBgResponse> {
  return await convexClient.action(api.uploads.removeBackground, {
    s3Key: imageUri,
  });
}
