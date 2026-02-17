import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useComposition } from "@/context/CompositionContext";
import { CardPreview } from "@/components/CardPreview";
import {
  mockCreateProject,
  mockRequestRender,
  mockGetRenderStatus,
} from "@/lib/mock-api";

type RenderState = "idle" | "rendering" | "completed" | "failed";

export default function Step3Screen() {
  const router = useRouter();
  const { state } = useComposition();
  const { composition } = state;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [renderState, setRenderState] = useState<RenderState>("idle");
  const [renderProgress, setRenderProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    const id = await mockCreateProject(
      `Eid Card ${Date.now()}`,
      composition,
    );
    setProjectId(id);
    setSaved(true);
    setSaving(false);
  };

  const handleRender = async () => {
    const pid = projectId ?? "unsaved";
    setRenderState("rendering");
    setRenderProgress(0);

    const renderId = await mockRequestRender(pid);

    // Poll for status
    const poll = async () => {
      const status = await mockGetRenderStatus(renderId);
      setRenderProgress(status.progress);

      if (status.status === "completed") {
        setRenderState("completed");
        setOutputUrl(status.outputUrl ?? null);
      } else if (status.status === "failed") {
        setRenderState("failed");
      } else {
        // Continue polling
        setTimeout(poll, 500);
      }
    };

    await poll();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a2e" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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
          Step 3
        </Text>
        <Text style={{ fontSize: 16, color: "#e0e0e0", marginBottom: 20 }}>
          Preview, save & render your card
        </Text>

        {/* Preview */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <CardPreview composition={composition} size="large" />
        </View>

        {/* Save button */}
        <Pressable
          testID="save-button"
          onPress={handleSave}
          disabled={saving || saved}
          accessibilityState={{ disabled: saving || saved }}
          style={{
            backgroundColor: saved ? "#00C853" : "#FFD700",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text
            style={{ color: "#1a1a2e", fontSize: 16, fontWeight: "bold" }}
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Project"}
          </Text>
        </Pressable>

        {/* Render button */}
        <Pressable
          testID="render-button"
          onPress={handleRender}
          disabled={renderState === "rendering" || renderState === "completed"}
          accessibilityState={{
            disabled:
              renderState === "rendering" || renderState === "completed",
          }}
          style={{
            backgroundColor:
              renderState === "completed" ? "#00C853" : "#FF69B4",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12,
            opacity: renderState === "rendering" ? 0.6 : 1,
          }}
        >
          <Text
            style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
          >
            {renderState === "idle" && "Render Video"}
            {renderState === "rendering" && "Rendering..."}
            {renderState === "completed" && "Render Complete!"}
            {renderState === "failed" && "Render Failed — Retry"}
          </Text>
        </Pressable>

        {/* Progress bar */}
        {(renderState === "rendering" || renderState === "completed") && (
          <View testID="render-progress" style={{ marginBottom: 16 }}>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${renderProgress}%`,
                  backgroundColor:
                    renderState === "completed" ? "#00C853" : "#FF69B4",
                  borderRadius: 4,
                }}
              />
            </View>
            <Text
              style={{
                color: "#aaa",
                fontSize: 12,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              {renderProgress}%
            </Text>
          </View>
        )}

        {/* Completion */}
        {renderState === "completed" && (
          <View testID="render-complete" style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: "#00C853",
                fontSize: 14,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              Your video is ready!
            </Text>
          </View>
        )}

        {/* Share button */}
        <Pressable
          testID="share-button"
          disabled={renderState !== "completed"}
          accessibilityState={{ disabled: renderState !== "completed" }}
          onPress={() => {
            // In production: Share.share({ url: outputUrl })
          }}
          style={{
            backgroundColor:
              renderState === "completed" ? "#2196F3" : "#555",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: renderState === "completed" ? "#fff" : "#999",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Share
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
