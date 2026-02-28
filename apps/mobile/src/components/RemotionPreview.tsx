import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import type { CompositionProps } from "@/types";
import { StaticCardPreview } from "./StaticCardPreview";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import { getHeadFilenameFromUrl, isKnownHeadFilename } from "@/lib/head-assets";

const PREVIEW_URL = (process.env.EXPO_PUBLIC_PREVIEW_URL ?? "").replace(/\/$/, "");

interface RemotionPreviewProps {
  composition: CompositionProps;
  width: number;
  height: number;
}

export function RemotionPreview({ composition, width, height }: RemotionPreviewProps) {
  const webViewRef = useRef<WebView>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const rawHeadUrl = composition.head?.imageUrl ?? "";
  const headFilename = getHeadFilenameFromUrl(rawHeadUrl);
  const usePreviewServerHead =
    PREVIEW_URL && headFilename && isKnownHeadFilename(headFilename);
  const resolvedHeadUrl = useResolvedImageUrl(usePreviewServerHead ? undefined : rawHeadUrl || undefined);
  const headImageUrl = usePreviewServerHead
    ? `${PREVIEW_URL}/assets/heads/${headFilename}`
    : (resolvedHeadUrl ?? rawHeadUrl);


  const injectComposition = useCallback(
    (comp: CompositionProps) => {
      if (!webViewRef.current) return;
      const payload = JSON.stringify({
        type: "UPDATE_COMPOSITION",
        composition: comp,
      });
      webViewRef.current.injectJavaScript(`
        window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(payload)} }));
        true;
      `);
    },
    [],
  );

  // After page loads, wait for React to mount then send composition
  useEffect(() => {
    if (!loaded) return;
    const comp = { ...composition, head: { ...composition.head, imageUrl: headImageUrl } };
    const timer = setTimeout(() => injectComposition(comp), 500);
    return () => clearTimeout(timer);
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send composition updates when composition or resolved head URL changes
  useEffect(() => {
    if (!loaded) return;
    const comp: CompositionProps = {
      ...composition,
      head: { ...composition.head, imageUrl: headImageUrl },
    };
    injectComposition(comp);
  }, [composition, headImageUrl, loaded, injectComposition]);

  if (!PREVIEW_URL || error) {
    return (
      <StaticCardPreview
        composition={composition}
        size={{ width, height }}
      />
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {!loaded && (
        <View style={StyleSheet.absoluteFill}>
          <StaticCardPreview
            composition={composition}
            size={{ width, height }}
          />
        </View>
      )}
      <WebView
        ref={webViewRef}
        testID="remotion-webview"
        source={{ uri: PREVIEW_URL }}
        onLoadEnd={() => setLoaded(true)}
        onError={() => setError(true)}
        style={[
          styles.webview,
          { width, height, opacity: loaded ? 1 : 0 },
        ]}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  webview: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "transparent",
  },
});
