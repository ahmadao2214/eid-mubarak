import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { CompositionProvider } from "@/context/CompositionContext";
import { getProject } from "@/repositories/projects";
import type { CompositionProps } from "@/types";

export default function CreateLayout() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const [initialComposition, setInitialComposition] = useState<CompositionProps | undefined>(undefined);
  const [loading, setLoading] = useState(!!projectId);

  useEffect(() => {
    if (!projectId) return;
    getProject(projectId).then((project) => {
      if (project) {
        setInitialComposition(project.composition);
      }
      setLoading(false);
    });
  }, [projectId]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator testID="create-layout-loading" size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <CompositionProvider initialComposition={initialComposition}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#1a1a2e" },
          animation: "slide_from_right",
        }}
      />
    </CompositionProvider>
  );
}
