import { mockRemoveBackground } from "../lib/mock-api";

export interface RemoveBgResult {
  transparentUrl: string | null;
  success: boolean;
  error?: string;
}

export async function removeBackground(
  imageUri: string
): Promise<RemoveBgResult> {
  try {
    // TODO: Replace mockRemoveBackground with real API call:
    // Option A: Direct remove.bg API call from app
    // Option B: Convex action api.photos.removeBackground({ s3Key })
    const { resultS3Url } = await mockRemoveBackground(imageUri);

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
