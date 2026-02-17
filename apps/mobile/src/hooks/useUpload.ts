import { mockGetUploadUrl, mockUploadToS3 } from "../lib/mock-api";

export interface UploadResult {
  s3Key: string | null;
  success: boolean;
  error?: string;
}

export async function uploadPhoto(localUri: string): Promise<UploadResult> {
  try {
    // Step 1: Get a presigned upload URL from the backend
    // TODO: Replace mockGetUploadUrl with real Convex call:
    // api.storage.getUploadUrl()
    const { url } = await mockGetUploadUrl();

    // Step 2: Upload to S3 using presigned URL
    // In production, this will fetch the local file and PUT to S3
    // TODO: Replace mockUploadToS3 with real S3 upload
    const s3Key = await mockUploadToS3(url, localUri as unknown as Blob);

    return { s3Key, success: true };
  } catch (error) {
    return {
      s3Key: null,
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
