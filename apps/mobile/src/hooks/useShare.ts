import * as Sharing from "expo-sharing";
import { Paths, File } from "expo-file-system/next";
import * as MediaLibrary from "expo-media-library";

export interface ShareResult {
  success: boolean;
  error?: string;
}

export async function downloadAndShare(outputUrl: string): Promise<ShareResult> {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      return { success: false, error: "Sharing is not available on this device" };
    }

    const downloadedFile = await File.downloadFileAsync(outputUrl, Paths.cache);

    await Sharing.shareAsync(downloadedFile.uri, {
      mimeType: "video/mp4",
      UTI: "public.mpeg-4",
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Share failed",
    };
  }
}

export async function saveToGallery(outputUrl: string): Promise<ShareResult> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      return { success: false, error: "Permission denied" };
    }

    const downloadedFile = await File.downloadFileAsync(outputUrl, Paths.cache);

    await MediaLibrary.saveToLibraryAsync(downloadedFile.uri);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Save failed",
    };
  }
}
