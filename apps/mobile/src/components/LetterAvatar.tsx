import React from "react";
import { View, Text } from "react-native";
import { Colors } from "@/lib/colors";

const AVATAR_COLORS = [
  "#E57373", "#F06292", "#BA68C8", "#9575CD",
  "#7986CB", "#64B5F6", "#4FC3F7", "#4DD0E1",
  "#4DB6AC", "#81C784", "#AED581", "#FFD54F",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

interface LetterAvatarProps {
  name: string;
  size: number;
  selected?: boolean;
  testID?: string;
}

export function LetterAvatar({ name, size, selected, testID }: LetterAvatarProps) {
  const initials = getInitials(name);
  const colorIndex = hashName(name) % AVATAR_COLORS.length;
  const bgColor = AVATAR_COLORS[colorIndex];

  return (
    <View
      testID={testID}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 3,
          borderColor: selected ? Colors.gold : "transparent",
        },
      ]}
    >
      <Text
        style={{
          color: Colors.textPrimary,
          fontSize: size * 0.38,
          fontWeight: "bold",
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
