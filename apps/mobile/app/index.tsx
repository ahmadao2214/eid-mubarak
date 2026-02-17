import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState } from "@/components/EmptyState";
import { listAllProjects, removeProject } from "@/repositories/projects";
import type { Project } from "@/types";

export default function HomeScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const list = await listAllProjects();
      setProjects(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProjects();
    } finally {
      setRefreshing(false);
    }
  }, [loadProjects]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeProject(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a2e" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
      >
        {/* Header */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#FFD700",
            marginBottom: 4,
          }}
        >
          Eid Mubarak!
        </Text>
        <Text style={{ fontSize: 16, color: "#e0e0e0", marginBottom: 24 }}>
          Create cheesy Eid video cards with maximum aunty energy
        </Text>

        {/* Create CTA */}
        <Pressable
          testID="create-new-card"
          onPress={() => router.push("/create/step1")}
          style={{
            backgroundColor: "#FFD700",
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1a1a2e" }}>
            Create New Card
          </Text>
        </Pressable>

        {/* Saved projects section */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#aaa",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Saved Projects
        </Text>

        {loading ? (
          <ActivityIndicator testID="loading-indicator" size="large" color="#FFD700" />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No saved projects"
            subtitle="Create a card to get started"
          />
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() =>
                router.push({
                  pathname: "/create/step1",
                  params: { projectId: project.id },
                })
              }
              onDelete={() => setDeleteTarget(project)}
            />
          ))
        )}
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
      >
        <ModalBackdrop />
        <ModalContent style={{ backgroundColor: "#2a2a3e", borderRadius: 16 }}>
          <ModalHeader>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              Delete Project
            </Text>
          </ModalHeader>
          <ModalBody>
            <Text style={{ color: "#ccc", fontSize: 14 }}>
              Are you sure you want to delete "{deleteTarget?.name}"? This cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              testID="cancel-delete"
              variant="outline"
              onPress={() => setDeleteTarget(null)}
              style={{ marginRight: 12 }}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              testID="confirm-delete"
              onPress={handleDelete}
              style={{ backgroundColor: "#FF5252" }}
            >
              <ButtonText style={{ color: "#fff" }}>Delete</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
