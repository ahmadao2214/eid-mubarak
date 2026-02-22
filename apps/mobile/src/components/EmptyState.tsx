import React from "react";
import { View, Text } from "react-native";
import { Colors } from "@/lib/colors";

interface EmptyStateProps {
  title: string;
  subtitle: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View testID="empty-state" style={{ alignItems: "center", paddingVertical: 40 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: Colors.textMuted, marginBottom: 8 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 14, color: Colors.textDisabled, textAlign: "center" }}>
        {subtitle}
      </Text>
    </View>
  );
}
