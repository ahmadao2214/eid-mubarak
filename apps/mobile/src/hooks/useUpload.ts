import { useAction } from "convex/react";
import * as FileSystem from "expo-file-system";
import { api } from "../../convex/_generated/api";
import type { UploadResult } from "@/types";

/** Guess content type from file URI (e.g. .png -> image/png). */
function contentTypeFromUri(uri: string): string {
  const ext = uri.replace(/\?.*$/, "").split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };
  return map[ext ?? ""] ?? "image/png";
}

/** Read local file (file:// or content://) as Blob using expo-file-system. React Native fetch() often fails for file URIs. */
async function readLocalFileAsBlob(uri: string): Promise<{ blob: Blob; contentType: string }> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const contentType = contentTypeFromUri(uri);
  return { blob: new Blob([bytes], { type: contentType }), contentType };
}

export function useUpload() {
  const getUploadUrl = useAction(api.storage.getUploadUrl);
  const confirmUploadAction = useAction(api.storage.confirmUpload);

  async function uploadPhoto(localUri: string): Promise<UploadResult> {
    try {
      const isLocal =
        localUri.startsWith("file://") || localUri.startsWith("content://");

      let blob: Blob;
      let contentType: string;

      if (isLocal) {
        const result = await readLocalFileAsBlob(localUri);
        blob = result.blob;
        contentType = result.contentType;
      } else {
        const fileResponse = await fetch(localUri);
        blob = await fileResponse.blob();
        contentType = blob.type || contentTypeFromUri(localUri);
      }

      const { url, s3Key, publicUrl } = await getUploadUrl({ contentType });

      const putResponse = await fetch(url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": contentType },
      });

      if (!putResponse.ok) {
        throw new Error(`Upload failed: ${putResponse.status}`);
      }

      await confirmUploadAction({ s3Key, type: "user-photo" });

      return { s3Key, s3Url: publicUrl, success: true };
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
