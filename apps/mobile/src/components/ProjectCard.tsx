import React from "react";
import { View, Text, Pressable } from "react-native";
import { CardPreview } from "./CardPreview";
import { Colors } from "@/lib/colors";
import { formatRelativeTime } from "@/lib/format-time";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onPress, onDelete }: ProjectCardProps) {
  return (
    <Pressable
      testID={`project-card-${project.id}`}
      onPress={onPress}
      style={{
        flexDirection: "row",
        backgroundColor: Colors.bgSurface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: "center",
      }}
    >
      <CardPreview composition={project.composition} size="small" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>
          {project.name}
        </Text>
        <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
          {formatRelativeTime(project.updatedAt)}
        </Text>
      </View>
      <Pressable
        testID={`delete-project-${project.id}`}
        onPress={(e) => {
          e?.stopPropagation?.();
          onDelete();
        }}
        style={{
          padding: 8,
        }}
      >
        <Text style={{ color: Colors.error, fontSize: 18 }}>X</Text>
      </Pressable>
    </Pressable>
  );
}
