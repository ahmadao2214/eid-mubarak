import React, { useState, useCallback, useRef } from "react";
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
import { useToast } from "@/context/ToastContext";
import { Colors } from "@/lib/colors";
import type { Project } from "@/types";

export default function SavedScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const isDeletingRef = useRef(false);

  const loadProjects = useCallback(async (isRefresh = false) => {
    try {
      const list = await listAllProjects();
      setProjects(list);
    } catch {
      showToast("Failed to load projects", "error");
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, [showToast]);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProjects(true);
    } finally {
      setRefreshing(false);
    }
  }, [loadProjects]);

  const handleDelete = async () => {
    if (!deleteTarget || isDeletingRef.current) return;
    isDeletingRef.current = true;
    try {
      await removeProject(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch {
      showToast("Failed to delete project. Please try again.", "error");
    } finally {
      setDeleteTarget(null);
      isDeletingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />
        }
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: Colors.gold,
            }}
          >
            My Vibes
          </Text>
          <Pressable
            testID="back-home-button"
            onPress={() => router.back()}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: Colors.gold }}>
              Back
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator testID="loading-indicator" size="large" color={Colors.gold} />
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
                router.replace({
                  pathname: "/create/editor",
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
        <ModalContent style={{ backgroundColor: Colors.bgSurface, borderRadius: 16 }}>
          <ModalHeader>
            <Text style={{ color: Colors.textPrimary, fontSize: 18, fontWeight: "bold" }}>
              Delete Project
            </Text>
          </ModalHeader>
          <ModalBody>
            <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
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
              style={{ backgroundColor: Colors.error }}
            >
              <ButtonText style={{ color: Colors.textPrimary }}>Delete</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
