import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { UploadResult } from "@/types";

/**
 * Hook that provides uploadPhoto using Convex presigned URLs and confirmUpload.
 * Must be used within ConvexProvider.
 */
export function useUpload() {
  const getUploadUrl = useAction(api.storage.getUploadUrl);
  const confirmUploadAction = useAction(api.storage.confirmUpload);

  async function uploadPhoto(localUri: string): Promise<UploadResult> {
    try {
      const fileResponse = await fetch(localUri);
      const blob = await fileResponse.blob();
      const contentType = blob.type || "image/png";

      const { url, s3Key } = await getUploadUrl({ contentType });

      const putResponse = await fetch(url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": contentType },
      });

      if (!putResponse.ok) {
        throw new Error(`Upload failed: ${putResponse.status}`);
      }

      await confirmUploadAction({ s3Key, type: "user-photo" });

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
