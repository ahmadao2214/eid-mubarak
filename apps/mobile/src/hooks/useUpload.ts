import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { UploadResult } from "@/types";

/**
 * Hook that provides uploadPhoto using Convex presigned URLs and confirmUpload.
 * Must be used within ConvexProvider.
 */
export function useUpload() {
  const getUploadUrl = useAction(api.storage.getUploadUrl);
  const confirmUploadMutation = useMutation(api.storage.confirmUpload);

  async function uploadPhoto(localUri: string): Promise<UploadResult> {
    try {
      const { url, s3Key } = await getUploadUrl();

      const fileResponse = await fetch(localUri);
      const blob = await fileResponse.blob();

      const putResponse = await fetch(url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "image/png" },
      });

      if (!putResponse.ok) {
        throw new Error(`Upload failed: ${putResponse.status}`);
      }

      await confirmUploadMutation({ s3Key, type: "user-photo" });

      return { s3Key, success: true };
    } catch (error) {
      return {
        s3Key: null,
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  return { uploadPhoto };
}
