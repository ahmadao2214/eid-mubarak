import React from "react";
import { View, Text } from "react-native";
import type { CompositionProps } from "@/types";
import { RN_FONT_MAP } from "@/lib/font-map";
import { Colors } from "@/lib/colors";

interface StaticCardPreviewProps {
  composition: CompositionProps;
  size: { width: number; height: number };
}

/**
 * Lightweight, non-animated card preview for use in grids/thumbnails.
 * Renders the same visual layout as AnimatedCardPreview but with zero
 * Reanimated overhead — just plain Views and Text.
 */
export function StaticCardPreview({ composition, size }: StaticCardPreviewProps) {
  const scale = size.width / composition.width;

  const bgColor =
    composition.background.type === "solid"
      ? composition.background.source
      : "#333333";

  const headSize = size.width * composition.head.scale;

  return (
    <View
      style={{
        width: size.width,
        height: size.height,
        backgroundColor: bgColor,
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Hue overlay */}
      {composition.hue.enabled && composition.hue.color !== "none" && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: composition.hue.color,
            opacity: composition.hue.opacity,
          }}
        />
      )}

      {/* Head circle */}
      <View
        style={{
          position: "absolute",
          left: (composition.head.position.x / 100) * size.width - headSize / 2,
          top: (composition.head.position.y / 100) * size.height - headSize / 2,
          width: headSize,
          height: headSize,
          borderRadius: headSize / 2,
          overflow: "hidden",
          borderWidth: 1.5,
          borderColor: Colors.gold,
          borderStyle: "dashed",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      />

      {/* Text slots — static, visible */}
      {composition.textSlots.map((slot) => (
        <Text
          key={slot.id}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: (slot.position.y / 100) * size.height,
            textAlign: "center",
            color: slot.color,
            fontSize: Math.max(slot.fontSize * scale, 6),
            fontWeight: "bold",
            ...(RN_FONT_MAP[slot.fontFamily] ?? {}),
          }}
          numberOfLines={1}
        >
          {slot.text}
        </Text>
      ))}
    </View>
  );
}
