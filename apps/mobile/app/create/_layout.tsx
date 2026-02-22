import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { CompositionProvider } from "@/context/CompositionContext";
import { useProject } from "@/hooks/useConvexData";
import { Colors } from "@/lib/colors";

export default function CreateLayout() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const { project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator testID="create-layout-loading" size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <CompositionProvider initialComposition={project?.composition} initialProjectId={project ? projectId : undefined}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bgPrimary },
          animation: "slide_from_right",
        }}
      />
    </CompositionProvider>
  );
}
