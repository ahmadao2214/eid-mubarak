import { staticFile } from "remotion";
import { isPlaceholderSource, resolvePlaceholder } from "./placeholders";

/** Fix wrong file extensions from older compositions saved in DB. */
const EXTENSION_FIXES: Record<string, string> = {
  "/assets/rose.jpg": "/assets/rose.png",
  "/assets/pakistani-truck-art-chain.png": "/assets/pakistani-truck-art-chain.jpg",
  "/assets/pakistani-truck-art-peacock.png": "/assets/pakistani-truck-art-peacock.jpg",
};

/**
 * Resolve an asset source to a URL that works in both dev and Lambda.
 *
 * - Placeholder sources → SVG data URIs via resolvePlaceholder()
 * - Local asset paths "/assets/..." → staticFile() for correct Lambda URLs
 * - Everything else (S3 URLs, presigned URLs) → pass through
 */
export function resolveAssetSrc(source: string): string {
  if (isPlaceholderSource(source)) {
    return resolvePlaceholder(source) ?? source;
  }
  const fixed = EXTENSION_FIXES[source] ?? source;
  if (fixed.startsWith("/assets/")) {
    return staticFile(fixed.slice(1));
  }
  return fixed;
}
