import { useAction } from "convex/react";
import { Platform } from "react-native";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { api } from "../../convex/_generated/api";
import type { UploadResult } from "@/types";
import { compressImageForUpload } from "@/lib/compressImageForUpload";

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

const isNative = Platform.OS === "ios" || Platform.OS === "android";

/** On native, uploadAsync only accepts file:// URIs. Copy content:// to a temp file first. */
async function ensureFileUriForUpload(uri: string): Promise<string> {
  if (uri.startsWith("file://")) return uri;
  if (!uri.startsWith("content://")) return uri;

  const ext = uri.replace(/\?.*$/, "").split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) ? ext : "jpg";
  const tempUri = `${FileSystemLegacy.cacheDirectory}upload-temp-${Date.now()}.${safeExt}`;
  await FileSystemLegacy.copyAsync({ from: uri, to: tempUri });
  return tempUri;
}

/** Read local file (file:// or content://) as Blob using legacy FileSystem. Used only on web for local paths. atob is available in React Native (Hermes/JSC). */
async function readLocalFileAsBlob(uri: string): Promise<{ blob: Blob; contentType: string }> {
  const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
    encoding: FileSystemLegacy.EncodingType.Base64,
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
      const contentType = contentTypeFromUri(localUri);

      // On native (iOS/Android), use FileSystem.uploadAsync. It only accepts file://;
      // copy content:// to a temp file first. Optionally compress large images to JPEG.
      if (isNative && isLocal) {
        let uriToUpload = localUri;
        let contentTypeToUse = contentType;
        let compressedTempUri: string | null = null;

        const compressed = await compressImageForUpload(localUri);
        if (compressed) {
          uriToUpload = compressed.uri;
          contentTypeToUse = compressed.contentType;
          compressedTempUri = compressed.uri;
        }

        const { url, s3Key, publicUrl } = await getUploadUrl({
          contentType: contentTypeToUse,
        });

        const fileUri = await ensureFileUriForUpload(uriToUpload);
        let contentCopyTempUri: string | null = fileUri !== uriToUpload ? fileUri : null;

        try {
          const result = await FileSystemLegacy.uploadAsync(url, fileUri, {
            httpMethod: "PUT",
            uploadType: FileSystemLegacy.FileSystemUploadType.BINARY_CONTENT,
            headers: { "Content-Type": contentTypeToUse },
          });

          if (result.status < 200 || result.status >= 300) {
            throw new Error(`Upload failed: ${result.status}`);
          }

          await confirmUploadAction({ s3Key, type: "user-photo" });
          return { s3Key, s3Url: publicUrl, success: true };
        } finally {
          for (const temp of [compressedTempUri, contentCopyTempUri]) {
            if (temp) {
              try {
                await FileSystemLegacy.deleteAsync(temp, { idempotent: true });
              } catch {
                // ignore cleanup errors
              }
            }
          }
        }
      }

      // Web or non-local URI (e.g. blob:): get blob then PUT
      let blob: Blob;
      if (isLocal) {
        const result = await readLocalFileAsBlob(localUri);
        blob = result.blob;
      } else {
        const fileResponse = await fetch(localUri);
        blob = await fileResponse.blob();
      }
      const resolvedContentType = blob.type || contentType;

      const { url, s3Key, publicUrl } = await getUploadUrl({
        contentType: resolvedContentType,
      });

      const putResponse = await fetch(url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": resolvedContentType },
      });

      if (!putResponse.ok) {
        throw new Error(`Upload failed: ${putResponse.status}`);
      }

      await confirmUploadAction({ s3Key, type: "user-photo" });

      return { s3Key, s3Url: publicUrl, success: true };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Upload failed";
      return {
        s3Key: null,
        success: false,
        error: message,
      };
    }
  }

  return { uploadPhoto };
}
