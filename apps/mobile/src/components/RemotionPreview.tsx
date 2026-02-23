import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import type { CompositionProps } from "@/types";
import { AnimatedCardPreview } from "./AnimatedCardPreview";

const PREVIEW_URL = process.env.EXPO_PUBLIC_PREVIEW_URL ?? "";

interface RemotionPreviewProps {
  composition: CompositionProps;
  width: number;
  height: number;
}

export function RemotionPreview({ composition, width, height }: RemotionPreviewProps) {
  const webViewRef = useRef<WebView>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (loaded && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "UPDATE_COMPOSITION",
          composition,
        }),
      );
    }
  }, [composition, loaded]);

  if (!PREVIEW_URL || error) {
    return (
      <AnimatedCardPreview
        composition={composition}
        size={{ width, height }}
      />
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {!loaded && (
        <View style={StyleSheet.absoluteFill}>
          <AnimatedCardPreview
            composition={composition}
            size={{ width, height }}
          />
        </View>
      )}
      <WebView
        ref={webViewRef}
        testID="remotion-webview"
        source={{ uri: PREVIEW_URL }}
        onLoad={() => setLoaded(true)}
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
  },
  webview: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "transparent",
  },
});
