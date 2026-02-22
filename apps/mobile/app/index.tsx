import React, { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TemplateCard } from "@/components/TemplateCard";
import { ProjectCard } from "@/components/ProjectCard";
import { PRESETS } from "@/lib/presets";
import { listAllProjects } from "@/repositories/projects";
import { Colors } from "@/lib/colors";
import type { Project } from "@/types";

export default function HomeScreen() {
  const router = useRouter();
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useFocusEffect(
    useCallback(() => {
      listAllProjects()
        .then((projects) => setRecentProjects(projects.slice(0, 3)))
        .catch(() => {});
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: Colors.gold,
            }}
          >
            Send Eid Vibes
          </Text>
          <Pressable
            testID="my-vibes-link"
            onPress={() => router.push("/saved")}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: Colors.gold,
              }}
            >
              My Vibes
            </Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 16, color: Colors.textSecondary, marginBottom: 24 }}>
          Create cheesy Eid video cards with maximum aunty energy
        </Text>

        {/* Create CTA */}
        <Pressable
          testID="create-new-card"
          onPress={() => router.push("/create/editor")}
          style={{
            backgroundColor: Colors.gold,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: Colors.bgPrimary }}>
            Send Vibes
          </Text>
        </Pressable>

        {/* Featured Templates */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: Colors.textMuted,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Featured Templates
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 28 }}
        >
          {PRESETS.map((preset) => (
            <TemplateCard
              key={preset.id}
              preset={preset}
              onPress={() =>
                router.push({
                  pathname: "/create/editor",
                  params: { presetId: preset.id },
                })
              }
              selected={false}
              testID={`featured-template-${preset.id}`}
            />
          ))}
        </ScrollView>

        {/* Recent Creations */}
        {recentProjects.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: Colors.textMuted,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Recent Creations
            </Text>
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() =>
                  router.push({
                    pathname: "/create/editor",
                    params: { projectId: project.id },
                  })
                }
                onDelete={() => {
                  setRecentProjects((prev) =>
                    prev.filter((p) => p.id !== project.id),
                  );
                }}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
