import React, { useEffect } from "react";
import { View, Text, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import type { CompositionProps } from "@/types";

type TextSlot = CompositionProps["textSlots"][number];

interface AnimatedCardPreviewProps {
  composition: CompositionProps;
  size: "small" | "large";
}

interface AnimatedTextSlotProps {
  slot: TextSlot;
  index: number;
  scale: number;
  dimensionsHeight: number;
}

function AnimatedTextSlot({ slot, index, scale, dimensionsHeight }: AnimatedTextSlotProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 200, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(index * 200, withTiming(0, { duration: 600 }));
  }, [index]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text
      testID={`text-slot-${slot.id}`}
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          top: (slot.position.y / 100) * dimensionsHeight,
          textAlign: "center",
          color: slot.color,
          fontSize: slot.fontSize * scale,
          fontWeight: "bold",
        },
        animStyle,
      ]}
      numberOfLines={1}
    >
      {slot.text}
    </Animated.Text>
  );
}

const SIZES = {
  small: { width: 135, height: 240 },
  large: { width: 270, height: 480 },
};

export function AnimatedCardPreview({ composition, size }: AnimatedCardPreviewProps) {
  const dimensions = SIZES[size];
  const scale = dimensions.width / composition.width;

  const bgColor =
    composition.background.type === "solid"
      ? composition.background.source
      : "#333333";

  const headSize = dimensions.width * composition.head.scale;

  // Hue pulse animation
  const hueOpacity = useSharedValue(composition.hue.opacity);
  useEffect(() => {
    if (composition.hue.enabled && composition.hue.animation === "pulse") {
      hueOpacity.value = withRepeat(
        withTiming(composition.hue.opacity * 0.3, { duration: 1500 }),
        -1,
        true,
      );
    } else {
      hueOpacity.value = composition.hue.opacity;
    }
  }, [composition.hue.enabled, composition.hue.animation, composition.hue.opacity]);

  const hueAnimatedStyle = useAnimatedStyle(() => ({
    opacity: hueOpacity.value,
  }));

  // Head scale bounce
  const headScale = useSharedValue(0);
  useEffect(() => {
    headScale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const headAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headScale.value }],
  }));

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
        <Animated.View
          testID="hue-overlay"
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: composition.hue.color,
            },
            hueAnimatedStyle,
          ]}
        />
      )}

      {/* Head image */}
      <Animated.View
        testID="head-container"
        style={[
          {
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
          },
          headAnimatedStyle,
        ]}
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
      </Animated.View>

      {/* Text slots */}
      {composition.textSlots.map((slot, index) => (
        <AnimatedTextSlot
          key={slot.id}
          slot={slot}
          index={index}
          scale={scale}
          dimensionsHeight={dimensions.height}
        />
      ))}
    </View>
  );
}
