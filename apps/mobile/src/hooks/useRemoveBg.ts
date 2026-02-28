import * as FileSystem from "expo-file-system/legacy";
import {
  removeBackground as repoRemoveBackground,
  removeBackgroundFromImage as repoRemoveBackgroundFromImage,
} from "../repositories/uploads";
import { compressImageForUpload } from "@/lib/compressImageForUpload";

export interface RemoveBgResult {
  transparentUrl: string | null;
  success: boolean;
  error?: string;
}

/** Ensure we have a file:// URI so we can read as base64 (copy content:// to temp if needed). */
async function ensureFileUri(uri: string): Promise<string> {
  if (uri.startsWith("file://")) return uri;
  if (!uri.startsWith("content://")) return uri;
  const ext = uri.replace(/\?.*$/, "").split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) ? ext : "jpg";
  const tempUri = `${FileSystem.cacheDirectory}rembg-temp-${Date.now()}.${safeExt}`;
  await FileSystem.copyAsync({ from: uri, to: tempUri });
  return tempUri;
}

/**
 * Remove background from a local image (file:// or content://), then Convex uploads only the result to S3.
 * No upload of the original photo. Use this after user picks/crops a photo.
 */
export async function removeBackgroundFromImage(
  localUri: string,
): Promise<RemoveBgResult> {
  try {
    const fileUri = await ensureFileUri(localUri);
    const compressed = await compressImageForUpload(fileUri);
    const uriToRead = compressed?.uri ?? fileUri;
    const base64 = await FileSystem.readAsStringAsync(uriToRead, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64) {
      return {
        transparentUrl: null,
        success: false,
        error: "Could not read image",
      };
    }
    const { resultS3Url } = await repoRemoveBackgroundFromImage(base64);
    return {
      transparentUrl: resultS3Url,
      success: true,
    };
  } catch (error) {
    return {
      transparentUrl: null,
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Background removal failed",
    };
  }
}

/** Remove background from an image already in S3 (by s3Key). Use when you already have an S3 key. */
export async function removeBackground(
  imageUri: string
): Promise<RemoveBgResult> {
  try {
    const { resultS3Url } = await repoRemoveBackground(imageUri);

    return {
      transparentUrl: resultS3Url,
      success: true,
    };
  } catch (error) {
    return {
      transparentUrl: null,
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Background removal failed",
    };
  }
}
