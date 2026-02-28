import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

/** Extract S3 key from our stored publicUrl (https://bucket.s3.region.amazonaws.com/key). */
export function extractS3Key(url: string): string | null {
  if (!url?.includes("amazonaws.com/")) return null;
  const after = url.split("amazonaws.com/")[1]?.split("?")[0];
  return after && (after.startsWith("user-photos/") || after.startsWith("rendered-videos/"))
    ? after
    : null;
}

/**
 * Returns a URL that can be used to fetch/display an image from S3 on load.
 * If the URI is our S3 URL (user-photos or rendered-videos), resolves it to a presigned GET URL
 * so it works with private buckets; otherwise returns the URI unchanged.
 */
export function useResolvedImageUrl(uri: string | null | undefined): string | null | undefined {
  const getDownloadUrl = useAction(api.storage.getDownloadUrl);
  const [resolved, setResolved] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (uri == null || uri === "") {
      setResolved(uri === "" ? null : undefined);
      return;
    }

    const s3Key = extractS3Key(uri);
    if (!s3Key) {
      setResolved(uri);
      return;
    }

    let cancelled = false;
    getDownloadUrl({ s3Key })
      .then(({ url }) => {
        if (!cancelled) setResolved(url);
      })
      .catch(() => {
        if (!cancelled) setResolved(uri);
      });
    return () => {
      cancelled = true;
    };
  // Intentionally [uri] only: including getDownloadUrl would cause infinite re-renders (useAction returns new ref each render).
  }, [uri]);

  if (uri == null || uri === "") return uri;
  if (extractS3Key(uri) == null) return uri;
  return resolved !== undefined ? resolved : uri;
}
