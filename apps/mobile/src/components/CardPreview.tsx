import React from "react";
import { View, Text, Image } from "react-native";
import type { CompositionProps } from "@/types";

interface CardPreviewProps {
  composition: CompositionProps;
  size: "small" | "large";
}

const SIZES = {
  small: { width: 135, height: 240 },
  large: { width: 270, height: 480 },
};

export function CardPreview({ composition, size }: CardPreviewProps) {
  const dimensions = SIZES[size];
  const scale = dimensions.width / composition.width;

  const bgColor =
    composition.background.type === "solid"
      ? composition.background.source
      : "#333333";

  const headSize = dimensions.width * composition.head.scale;

  return (
    <View
      testID="card-preview"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: bgColor,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Hue overlay */}
      {composition.hue.enabled && composition.hue.color !== "none" && (
        <View
          testID="hue-overlay"
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

      {/* Head image */}
      <View
        testID="head-container"
        style={{
          position: "absolute",
          left: (composition.head.position.x / 100) * dimensions.width - headSize / 2,
          top: (composition.head.position.y / 100) * dimensions.height - headSize / 2,
          width: headSize,
          height: headSize,
          borderRadius: headSize / 2,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: "#FFD700",
          borderStyle: composition.head.imageUrl ? "solid" : "dashed",
        }}
      >
        {composition.head.imageUrl ? (
          <Image
            testID="head-image"
            source={{ uri: composition.head.imageUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View
            testID="head-placeholder"
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{ color: "#999", fontSize: 10 * (size === "large" ? 2 : 1) }}>
              Photo
            </Text>
          </View>
        )}
      </View>

      {/* Text slots */}
      {composition.textSlots.map((slot) => (
        <Text
          key={slot.id}
          testID={`text-slot-${slot.id}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: (slot.position.y / 100) * dimensions.height,
            textAlign: "center",
            color: slot.color,
            fontSize: slot.fontSize * scale,
            fontWeight: "bold",
          }}
          numberOfLines={1}
        >
          {slot.text}
        </Text>
      ))}
    </View>
  );
}
