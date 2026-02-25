import { Platform, Image } from "react-native";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const MAX_UPLOAD_DIMENSION = 1200;
const JPEG_QUALITY = 0.85;
const isNative = Platform.OS === "ios" || Platform.OS === "android";

/**
 * Resize image to max dimension and compress as JPEG.
 * Only runs on native; returns null on web or on failure (e.g. can't get dimensions).
 */
export async function compressImageForUpload(
  uri: string
): Promise<{ uri: string; contentType: string } | null> {
  if (!isNative) return null;

  try {
    const { width, height } = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        Image.getSize(uri, (w, h) => resolve({ width: w, height: h }), reject);
      }
    );
    const maxDim = Math.max(width, height);
    if (maxDim <= MAX_UPLOAD_DIMENSION) return null;

    const action =
      width >= height
        ? [{ resize: { width: MAX_UPLOAD_DIMENSION } }]
        : [{ resize: { height: MAX_UPLOAD_DIMENSION } }];
    const result = await manipulateAsync(uri, action, {
      format: SaveFormat.JPEG,
      compress: JPEG_QUALITY,
    });
    return { uri: result.uri, contentType: "image/jpeg" };
  } catch {
    return null;
  }
}
