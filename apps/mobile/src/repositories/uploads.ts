import {
  mockGetUploadUrl,
  mockUploadToS3,
  mockRemoveBackground,
} from "@/lib/mock-api";
import type { UploadUrlResponse, RemoveBgResponse } from "@/types";

export async function getUploadUrl(): Promise<UploadUrlResponse> {
  return mockGetUploadUrl();
}

export async function uploadToS3(
  presignedUrl: string,
  file: Blob | ArrayBuffer,
): Promise<string> {
  return mockUploadToS3(presignedUrl, file);
}

export async function removeBackground(
  imageUri: string,
): Promise<RemoveBgResponse> {
  return mockRemoveBackground(imageUri);
}
