import React from "react";
import { View, Text, Pressable } from "react-native";
import { AnimatedCardPreview } from "./AnimatedCardPreview";
import { Colors } from "@/lib/colors";
import type { PresetConfig } from "@/lib/presets";

interface TemplateCardProps {
  preset: PresetConfig;
  onPress: () => void;
  selected: boolean;
  testID?: string;
}

export function TemplateCard({ preset, onPress, selected, testID }: TemplateCardProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        width: 140,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: selected ? Colors.goldMuted : Colors.bgSurface,
        borderWidth: 2,
        borderColor: selected ? Colors.gold : Colors.borderSubtle,
        overflow: "hidden",
      }}
    >
      <View style={{ alignItems: "center", paddingTop: 8 }}>
        <AnimatedCardPreview
          composition={preset.defaultProps}
          size={{ width: 120, height: 213 }}
        />
      </View>
      <View style={{ padding: 8 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "bold",
            color: Colors.textPrimary,
          }}
          numberOfLines={1}
        >
          {preset.name}
        </Text>
      </View>
    </Pressable>
  );
}
