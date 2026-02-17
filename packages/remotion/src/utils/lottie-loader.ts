// Lottie data loader using Remotion's delayRender/continueRender pattern
// Returns null for placeholder sources so components fall back to SVG

import { useCallback, useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";
import { isPlaceholderSource } from "./placeholders";

export function useLottieData(source: string): object | null {
  const [data, setData] = useState<object | null>(null);
  const [handle] = useState(() => {
    // Skip delay for placeholder sources — they render SVG instead
    if (isPlaceholderSource(source) || !source) return null;
    return delayRender(`Loading Lottie: ${source}`);
  });

  const fetchData = useCallback(async () => {
    if (isPlaceholderSource(source) || !source || handle === null) return;

    try {
      const response = await fetch(source);
      const json = await response.json();
      setData(json);
      continueRender(handle);
    } catch (err) {
      cancelRender(err);
    }
  }, [source, handle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return data;
}
