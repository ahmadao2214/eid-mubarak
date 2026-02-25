import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, Platform, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useComposition } from "@/context/CompositionContext";
import { AnimatedCardPreview } from "@/components/AnimatedCardPreview";
import {
  useCreateProject,
  useUpdateProject,
  useRequestRender,
  useRenderStatus,
} from "@/hooks/useConvexData";
import { useUpload } from "@/hooks/useUpload";
import { downloadAndShare, saveToGallery } from "@/hooks/useShare";
import { useToast } from "@/context/ToastContext";
import { Colors } from "@/lib/colors";
import type { Id } from "../../convex/_generated/dataModel";
import type { CompositionProps } from "@/types/composition";

function isLocalImageUrl(url: string): boolean {
  if (!url?.trim()) return false;
  return (
    url.startsWith("file://") ||
    url.startsWith("content://") ||
    (!url.startsWith("http://") && !url.startsWith("https://"))
  );
}

type ShareState = "idle" | "saving" | "rendering" | "ready" | "failed";

export default function Step3Screen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { state, setProjectId, setHeadImage } = useComposition();
  const { composition } = state;
  const { uploadPhoto } = useUpload();

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const requestRenderMutation = useRequestRender();

  const [shareState, setShareState] = useState<ShareState>("idle");
  const [renderId, setRenderId] = useState<string | undefined>(undefined);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [savedDraft, setSavedDraft] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const isSharingRef = useRef(false);
  const isSavingDraftRef = useRef(false);
  const isShareActionRef = useRef(false);

  // Reactive render status — auto-updates via WebSocket, no polling needed
  const renderStatus = useRenderStatus(renderId);

  // React to render status changes
  useEffect(() => {
    if (!renderStatus || shareState !== "rendering") return;
    if (renderStatus.status === "completed") {
      setShareState("ready");
      setOutputUrl(renderStatus.outputUrl ?? null);
    } else if (renderStatus.status === "failed") {
      setShareState("failed");
    }
  }, [renderStatus, shareState]);

  const progress = renderStatus?.progress ?? 0;

  /** If head image is a local file, upload to S3 and return composition with S3 URL; otherwise return current composition. On failure returns { composition: null, error } so the UI can show the real error. */
  const ensureHeadImageUploaded = async (): Promise<
    { composition: CompositionProps; error?: undefined } | { composition: null; error: string }
  > => {
    const headUrl = composition.head?.imageUrl;
    if (!headUrl || !isLocalImageUrl(headUrl)) return { composition };

    const result = await uploadPhoto(headUrl);
    if (!result.success || !result.s3Url) {
      return { composition: null, error: result.error ?? "Failed to upload photo" };
    }

    const updatedComposition: CompositionProps = {
      ...composition,
      head: { ...composition.head, imageUrl: result.s3Url },
    };
    setHeadImage(result.s3Url);
    return { composition: updatedComposition };
  };

  const handleShare = async () => {
    if (isSharingRef.current || isSavingDraftRef.current) return;
    isSharingRef.current = true;
    setSavedDraft(false);
    setShareError(null);
    try {
      setShareState("saving");
      const { composition: compositionToSave, error: uploadError } = await ensureHeadImageUploaded();
      if (!compositionToSave) {
        setShareState("failed");
        const msg = uploadError ?? "Failed to upload photo. Please try again.";
        setShareError(msg);
        if (Platform.OS === "ios" || Platform.OS === "android") {
          Alert.alert("Upload failed", msg);
        }
        isSharingRef.current = false;
        return;
      }

      let projectId = state.projectId;
      if (projectId) {
        await updateProjectMutation({
          id: projectId as Id<"projects">,
          composition: compositionToSave,
        });
      } else {
        projectId = await createProjectMutation({
          name: `Eid Card ${Date.now()}`,
          templateId: "default",
          composition: compositionToSave,
        });
        setProjectId(projectId);
      }

      // Step 2: Request render — status updates arrive reactively via useRenderStatus
      setShareState("rendering");
      const newRenderId = await requestRenderMutation({
        projectId: projectId as Id<"projects">,
      });
      setRenderId(newRenderId);
    } catch (error) {
      setShareState("failed");
      setShareError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      isSharingRef.current = false;
    }
  };

  const handleSaveDraft = async () => {
    if (isSavingDraftRef.current) return;
    isSavingDraftRef.current = true;
    try {
      const { composition: compositionToSave, error: uploadError } = await ensureHeadImageUploaded();
      if (!compositionToSave) {
        const msg = uploadError ?? "Failed to upload photo. Please try again.";
        showToast(msg, "error");
        if (Platform.OS === "ios" || Platform.OS === "android") {
          Alert.alert("Upload failed", msg);
        }
        isSavingDraftRef.current = false;
        return;
      }

      if (state.projectId) {
        await updateProjectMutation({
          id: state.projectId as Id<"projects">,
          composition: compositionToSave,
        });
      } else {
        const newId = await createProjectMutation({
          name: `Draft ${Date.now()}`,
          templateId: "default",
          composition: compositionToSave,
        });
        setProjectId(newId);
      }
      setSavedDraft(true);
    } catch {
      showToast("Failed to save draft. Please try again.", "error");
    } finally {
      isSavingDraftRef.current = false;
    }
  };

  const { height: screenHeight } = useWindowDimensions();
  const previewMaxHeight = Math.round(screenHeight * 0.4);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Header row with back */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Pressable testID="back-button-top" onPress={() => router.back()}>
            <Text style={{ color: Colors.gold, fontSize: 16, fontWeight: "600" }}>
              Back
            </Text>
          </Pressable>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: Colors.textPrimary,
            }}
          >
            Share Your Vibe
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Preview — height-constrained */}
        <View style={{ alignItems: "center", marginBottom: 20, maxHeight: previewMaxHeight }}>
          <AnimatedCardPreview composition={composition} size={{ width: Math.round(previewMaxHeight * (9 / 16)), height: previewMaxHeight }} />
        </View>

        {/* Status message */}
        {statusMessage && (
          <View testID="share-status" style={{ marginBottom: 16 }}>
            <Text
              style={{
                color:
                  shareState === "ready"
                    ? Colors.success
                    : shareState === "failed"
                      ? Colors.error
                      : Colors.textSecondary,
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
                backgroundColor: Colors.bgSurface,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${shareState === "saving" ? 20 : progress}%`,
                  backgroundColor: Colors.gold,
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
                color: Colors.success,
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
                  color: Colors.error,
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
                backgroundColor: Colors.success,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: "bold" }}>
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
                backgroundColor: Colors.bgSurface,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: Colors.textPrimary, fontSize: 16, fontWeight: "bold" }}>
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
              backgroundColor: isProcessing ? Colors.textDisabled : Colors.gold,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 12,
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            <Text
              style={{
                color: isProcessing ? Colors.textMuted : Colors.bgPrimary,
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
              color: savedDraft ? Colors.success : Colors.textMuted,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {savedDraft ? "Draft saved" : "Save as draft"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
