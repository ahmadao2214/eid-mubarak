import React from "react";
import { View, Text, Pressable } from "react-native";
import { RemotionPreview } from "./RemotionPreview";
import { StaticCardPreview } from "./StaticCardPreview";
import { Colors } from "@/lib/colors";
import type { PresetConfig } from "@/lib/presets";

interface TemplateCardProps {
  preset: PresetConfig;
  onPress: () => void;
  selected: boolean;
  width?: number;
  testID?: string;
  /** When true, uses live Remotion WebView for exact render. Default: false (static). */
  livePreview?: boolean;
}

export function TemplateCard({ preset, onPress, selected, width = 140, testID, livePreview = false }: TemplateCardProps) {
  const previewWidth = width - 16;
  const previewHeight = Math.round(previewWidth * (16 / 9));

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        width,
        borderRadius: 10,
        backgroundColor: selected ? Colors.goldMuted : Colors.bgSurface,
        borderWidth: 2,
        borderColor: selected ? Colors.gold : Colors.borderSubtle,
        overflow: "hidden",
      }}
    >
      <View style={{ alignItems: "center", paddingTop: 8, paddingHorizontal: 8 }}>
        {livePreview ? (
          <RemotionPreview
            composition={preset.defaultProps}
            width={previewWidth}
            height={previewHeight}
          />
        ) : (
          <StaticCardPreview
            composition={preset.defaultProps}
            size={{ width: previewWidth, height: previewHeight }}
          />
        )}
      </View>
      <View style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: Colors.textPrimary,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {preset.name}
        </Text>
      </View>
    </Pressable>
  );
}
