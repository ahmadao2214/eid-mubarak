/**
 * Built-in head assets: filenames that exist in assets/heads and preview public.
 * Used for grid thumbnails (bundled) and template preview (preview server URL).
 */
export const KNOWN_HEAD_FILENAMES = [
  "zohran.png",
  "central-cee.png",
  "drak-hijab.png",
  "mufti.png",
  "onijah-robinson.png",
  "sehad-kamran.png",
  "srk.jpg",
] as const;

const KNOWN_SET = new Set(KNOWN_HEAD_FILENAMES);

/** Extract filename after "heads/" from S3 or /assets/ path; returns lowercase. */
export function getHeadFilenameFromUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl?.includes("heads/")) return null;
  const part = imageUrl.split("heads/")[1]?.split("?")[0]?.trim();
  return part ? part.toLowerCase() : null;
}

export function isKnownHeadFilename(filename: string): boolean {
  return KNOWN_SET.has(filename as (typeof KNOWN_HEAD_FILENAMES)[number]);
}
