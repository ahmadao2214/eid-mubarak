import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useComposition } from "@/context/CompositionContext";
import { AnimatedCardPreview } from "@/components/AnimatedCardPreview";
import { createProject, updateProject } from "@/repositories/projects";
import { requestRender, getRenderStatus } from "@/repositories/renders";
import { downloadAndShare, saveToGallery } from "@/hooks/useShare";
import { useToast } from "@/context/ToastContext";

type ShareState = "idle" | "saving" | "rendering" | "ready" | "failed";

export default function Step3Screen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { state, setProjectId } = useComposition();
  const { composition } = state;

  const [shareState, setShareState] = useState<ShareState>("idle");
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [savedDraft, setSavedDraft] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const isSharingRef = useRef(false);
  const isSavingDraftRef = useRef(false);
  const isShareActionRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  const handleShare = async () => {
    if (isSharingRef.current || isSavingDraftRef.current) return;
    isSharingRef.current = true;
    setSavedDraft(false);
    try {
      cancelledRef.current = false;

      // Step 1: Save or update project
      setShareState("saving");
      setProgress(0);
      let projectId = state.projectId;
      if (projectId) {
        await updateProject(projectId, composition);
      } else {
        projectId = await createProject(
          `Eid Card ${Date.now()}`,
          composition,
        );
        setProjectId(projectId);
      }
      if (cancelledRef.current) return;

      // Step 2: Render video
      setShareState("rendering");
      const renderId = await requestRender(projectId);
      if (cancelledRef.current) return;

      // Step 3: Poll for completion
      const poll = async () => {
        if (cancelledRef.current) return;
        const status = await getRenderStatus(renderId);
        if (cancelledRef.current) return;
        setProgress(status.progress);

        if (status.status === "completed") {
          setShareState("ready");
          setOutputUrl(status.outputUrl ?? null);
        } else if (status.status === "failed") {
          setShareState("failed");
        } else {
          pollTimerRef.current = setTimeout(poll, 500);
        }
      };
      await poll();
    } catch {
      if (!cancelledRef.current) {
        setShareState("failed");
      }
    } finally {
      isSharingRef.current = false;
    }
  };

  const handleSaveDraft = async () => {
    if (isSavingDraftRef.current) return;
    isSavingDraftRef.current = true;
    try {
      if (state.projectId) {
        await updateProject(state.projectId, composition);
      } else {
        const newId = await createProject(`Draft ${Date.now()}`, composition);
        setProjectId(newId);
      }
      setSavedDraft(true);
    } catch {
      showToast("Failed to save draft. Please try again.", "error");
    } finally {
      isSavingDraftRef.current = false;
    }
  };

  const isProcessing = shareState === "saving" || shareState === "rendering";

  const shareLabel = {
    idle: "Share",
    saving: "Preparing...",
    rendering: "Rendering...",
    ready: "Share Again",
    failed: "Retry",
  }[shareState];

  const statusMessage = {
    idle: null,
    saving: "Saving your card...",
    rendering: `Rendering video... ${progress}%`,
    ready: null,
    failed: "Something went wrong. Try again.",
  }[shareState];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a2e" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#FFD700",
            marginBottom: 4,
          }}
        >
          Preview
        </Text>
        <Text style={{ fontSize: 16, color: "#e0e0e0", marginBottom: 20 }}>
          Here's your card — share it with the world!
        </Text>

        {/* Preview */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <AnimatedCardPreview composition={composition} size="large" />
        </View>

        {/* Status message */}
        {statusMessage && (
          <View testID="share-status" style={{ marginBottom: 16 }}>
            <Text
              style={{
                color:
                  shareState === "ready"
                    ? "#00C853"
                    : shareState === "failed"
                      ? "#FF5252"
                      : "#e0e0e0",
                fontSize: 14,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {statusMessage}
            </Text>
          </View>
        )}

        {/* Progress bar */}
        {isProcessing && (
          <View testID="share-progress" style={{ marginBottom: 20 }}>
            <View
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${shareState === "saving" ? 20 : progress}%`,
                  backgroundColor: "#FFD700",
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        )}

        {/* Ready state with share actions */}
        {shareState === "ready" && (
          <View testID="share-ready" style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: "#00C853",
                fontSize: 14,
                textAlign: "center",
                fontWeight: "600",
                marginBottom: 16,
              }}
            >
              Your video is ready!
            </Text>

            {shareError && (
              <Text
                testID="share-error"
                style={{
                  color: "#FF5252",
                  fontSize: 13,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                {shareError}
              </Text>
            )}

            <Pressable
              testID="share-video-button"
              onPress={async () => {
                if (!outputUrl || isShareActionRef.current) return;
                isShareActionRef.current = true;
                setShareError(null);
                try {
                  const result = await downloadAndShare(outputUrl);
                  if (!result.success) setShareError(result.error ?? "Share failed");
                } finally {
                  isShareActionRef.current = false;
                }
              }}
              style={{
                backgroundColor: "#00C853",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                Share Video
              </Text>
            </Pressable>

            <Pressable
              testID="save-gallery-button"
              onPress={async () => {
                if (!outputUrl || isShareActionRef.current) return;
                isShareActionRef.current = true;
                setShareError(null);
                try {
                  const result = await saveToGallery(outputUrl);
                  if (!result.success) setShareError(result.error ?? "Save failed");
                } finally {
                  isShareActionRef.current = false;
                }
              }}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                Save to Camera Roll
              </Text>
            </Pressable>
          </View>
        )}

        {/* Render button (primary action, before ready) */}
        {shareState !== "ready" && (
          <Pressable
            testID="share-button"
            onPress={handleShare}
            disabled={isProcessing}
            accessibilityState={{ disabled: isProcessing }}
            style={{
              backgroundColor: isProcessing ? "#555" : "#FFD700",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 12,
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            <Text
              style={{
                color: isProcessing ? "#999" : "#1a1a2e",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {shareLabel}
            </Text>
          </Pressable>
        )}

        {/* Save draft (secondary, subtle) */}
        <Pressable
          testID="save-draft-button"
          onPress={handleSaveDraft}
          disabled={savedDraft || isProcessing}
          accessibilityState={{ disabled: savedDraft || isProcessing }}
          style={{
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: savedDraft ? "#00C853" : "#999",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {savedDraft ? "Draft saved" : "Save as draft"}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Bottom back button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          paddingBottom: 36,
          backgroundColor: "#1a1a2e",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.1)",
        }}
      >
        <Pressable
          testID="back-button"
          onPress={() => router.back()}
          style={{
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#FFD700",
          }}
        >
          <Text
            style={{ color: "#FFD700", fontSize: 16, fontWeight: "bold" }}
          >
            Back
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
