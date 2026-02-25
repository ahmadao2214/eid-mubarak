import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
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
import { useAllProjects, useRemoveProject } from "@/hooks/useConvexData";
import { useToast } from "@/context/ToastContext";
import { Colors } from "@/lib/colors";
import type { Project } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";

export default function SavedScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { projects, isLoading: loading } = useAllProjects();
  const removeProjectMutation = useRemoveProject();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const isDeletingRef = useRef(false);

  const handleDelete = async () => {
    if (!deleteTarget || isDeletingRef.current) return;
    isDeletingRef.current = true;
    try {
      await removeProjectMutation({ id: deleteTarget.id as Id<"projects"> });
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
            title="No vibes yet"
            subtitle="Create a card and save it here"
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
