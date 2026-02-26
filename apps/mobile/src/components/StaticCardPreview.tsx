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
 * Maps background image sources to representative native colors
 * for lightweight mobile preview rendering.
 */
const PLACEHOLDER_BG_COLORS: Record<string, string> = {
  "/assets/ladakh-highway.jpg": "#2a1043",
  "/assets/pakistan-truck-art.jpg": "#5C3A1E",
  "/assets/zagros-mtns.jpg": "#C46A28",
};

/**
 * Maps decorative element sources to simple visual hints for mobile preview.
 */
const DECORATIVE_COLORS: Record<string, { color: string; shape: "heart" | "circle" | "border" }> = {
  "/assets/rose.jpg": { color: "#FF69B4", shape: "heart" },
  "/assets/moon-crescent-icon-moon.jpg": { color: "#FFD700", shape: "circle" },
  "placeholder:gold-particles": { color: "#FFD700", shape: "circle" },
  "/assets/pakistani-truck-art-fram.jpg": { color: "#F5A623", shape: "border" },
  "placeholder:sparkle-overlay": { color: "#FFD700", shape: "circle" },
};

function resolveBackground(source: string, type: string): string {
  if (type === "solid") return source;
  return PLACEHOLDER_BG_COLORS[source] ?? "#333333";
}

/**
 * Lightweight, non-animated card preview for use in grids/thumbnails.
 * Renders the same visual layout as the Remotion preview but with zero
 * Reanimated or WebView overhead — just plain Views and Text.
 */
export function StaticCardPreview({ composition, size }: StaticCardPreviewProps) {
  const scale = size.width / composition.width;

  const bgColor = resolveBackground(
    composition.background.source,
    composition.background.type,
  );

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

      {/* Decorative element hints */}
      {composition.decorativeElements.map((el, i) => {
        const hint = DECORATIVE_COLORS[el.source];
        if (!hint) return null;
        const elSize = size.width * (el.scale ?? 0.5) * 0.3;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: (el.position.x / 100) * size.width - elSize / 2,
              top: (el.position.y / 100) * size.height - elSize / 2,
              width: elSize,
              height: hint.shape === "border" ? elSize : elSize,
              borderRadius: hint.shape === "border" ? 4 : elSize / 2,
              backgroundColor: hint.shape === "border" ? "transparent" : hint.color,
              borderWidth: hint.shape === "border" ? 1.5 : 0,
              borderColor: hint.color,
              opacity: 0.5,
            }}
          />
        );
      })}

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
            left: 4,
            right: 4,
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
