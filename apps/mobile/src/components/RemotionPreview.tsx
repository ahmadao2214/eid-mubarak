import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
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
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const rawHeadUrl = composition.head?.imageUrl ?? "";
  const headFilename = getHeadFilenameFromUrl(rawHeadUrl);
  const usePreviewServerHead =
    PREVIEW_URL && headFilename && isKnownHeadFilename(headFilename);
  const resolvedHeadUrl = useResolvedImageUrl(usePreviewServerHead ? undefined : rawHeadUrl || undefined);
  const headImageUrl = usePreviewServerHead
    ? `${PREVIEW_URL}/assets/heads/${headFilename}`
    : (resolvedHeadUrl ?? rawHeadUrl);

  const buildComp = useCallback((): CompositionProps => ({
    ...composition,
    head: { ...composition.head, imageUrl: headImageUrl },
  }), [composition, headImageUrl]);

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

  // When the WebView's React app sends READY (on mount), send the composition
  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === "READY") {
          setReady(true);
          injectComposition(buildComp());
        } else if (msg.type === "ACK") {
          setReady(true);
        }
      } catch {
        // ignore parse errors
      }
    },
    [injectComposition, buildComp],
  );

  // Send composition updates whenever composition or head URL changes
  useEffect(() => {
    if (!ready) return;
    injectComposition(buildComp());
  }, [composition, headImageUrl, ready, injectComposition, buildComp]);

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
      {!ready && (
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
        onMessage={handleWebViewMessage}
        onError={() => setError(true)}
        style={[
          styles.webview,
          { width, height, opacity: ready ? 1 : 0 },
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
