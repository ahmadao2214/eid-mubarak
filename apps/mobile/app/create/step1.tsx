import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useComposition } from "@/context/CompositionContext";
import { PRESETS } from "@/lib/presets";
import { pickImageFromGallery, pickImageFromCamera, cropToSquare } from "@/hooks/useImagePicker";
import { removeBackground } from "@/hooks/useRemoveBg";
import { mockListCelebrityHeads } from "@/lib/mock-api";
import type { PresetId, HueColor, CelebrityHead } from "@/types";

const HUE_DISPLAY: Record<HueColor, string> = {
  "#FFD700": "#FFD700",
  "#FF69B4": "#FF69B4",
  "#00C853": "#00C853",
  "#2196F3": "#2196F3",
  "#F5A623": "#F5A623",
  none: "#666666",
};

export default function Step1Screen() {
  const router = useRouter();
  const { state, selectPreset, setHeadImage } = useComposition();
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [removingBg, setRemovingBg] = useState(false);
  const [celebHeads, setCelebHeads] = useState<CelebrityHead[]>([]);
  const [selectedCelebId, setSelectedCelebId] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<"celeb" | "custom" | null>(null);

  useEffect(() => {
    mockListCelebrityHeads().then(setCelebHeads);
  }, []);

  const hasPreset = state.selectedPresetId !== null;
  const hasImage = localImage !== null;
  const canProceed = hasPreset && hasImage;

  const handleSelectCeleb = (celeb: CelebrityHead) => {
    setSelectedCelebId(celeb.id);
    setImageSource("celeb");
    setLocalImage(celeb.imageUrl);
    setHeadImage(celeb.imageUrl);
  };

  const handlePickGallery = async () => {
    const result = await pickImageFromGallery();
    if (result) {
      const cropped = await cropToSquare(result.uri, result.width, result.height);
      setSelectedCelebId(null);
      setImageSource("custom");
      setLocalImage(cropped);
      setHeadImage(cropped);
    }
  };

  const handlePickCamera = async () => {
    const result = await pickImageFromCamera();
    if (result) {
      const cropped = await cropToSquare(result.uri, result.width, result.height);
      setSelectedCelebId(null);
      setImageSource("custom");
      setLocalImage(cropped);
      setHeadImage(cropped);
    }
  };

  const handleRemoveBg = async () => {
    if (!localImage) return;
    setRemovingBg(true);
    const result = await removeBackground(localImage);
    if (result.success && result.transparentUrl) {
      setLocalImage(result.transparentUrl);
      setHeadImage(result.transparentUrl);
    }
    setRemovingBg(false);
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
          Step 1
        </Text>
        <Text style={{ fontSize: 16, color: "#e0e0e0", marginBottom: 20 }}>
          Pick a preset and upload your head photo
        </Text>

        {/* Preset cards */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#aaa",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Choose a Preset
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PRESETS.map((preset) => {
            const isSelected = state.selectedPresetId === preset.id;
            const hueColor = HUE_DISPLAY[preset.defaultProps.hue.color];
            return (
              <Pressable
                key={preset.id}
                testID={
                  isSelected
                    ? `preset-card-${preset.id}-selected`
                    : `preset-card-${preset.id}`
                }
                onPress={() => selectPreset(preset.id)}
                style={{
                  width: 120,
                  marginRight: 12,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: isSelected
                    ? "rgba(255,215,0,0.15)"
                    : "rgba(255,255,255,0.05)",
                  borderWidth: 2,
                  borderColor: isSelected ? "#FFD700" : "transparent",
                }}
              >
                {/* Hue swatch */}
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: hueColor,
                    marginBottom: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "bold",
                    color: "#fff",
                    marginBottom: 4,
                  }}
                  numberOfLines={1}
                >
                  {preset.name}
                </Text>
                <Text
                  style={{ fontSize: 11, color: "#999" }}
                  numberOfLines={2}
                >
                  {preset.description}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Head selection section */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#aaa",
            marginTop: 28,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Choose a Head
        </Text>

        {/* Celebrity heads */}
        {celebHeads.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            {celebHeads.map((celeb) => {
              const isSelected = selectedCelebId === celeb.id;
              return (
                <Pressable
                  key={celeb.id}
                  testID={`celeb-head-${celeb.id}`}
                  onPress={() => handleSelectCeleb(celeb)}
                  style={{
                    alignItems: "center",
                    marginRight: 14,
                    width: 80,
                  }}
                >
                  <Image
                    source={{ uri: celeb.thumbnail }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      borderWidth: 3,
                      borderColor: isSelected ? "#FFD700" : "rgba(255,255,255,0.15)",
                    }}
                  />
                  <Text
                    style={{
                      color: isSelected ? "#FFD700" : "#ccc",
                      fontSize: 11,
                      marginTop: 4,
                      textAlign: "center",
                      fontWeight: isSelected ? "bold" : "normal",
                    }}
                    numberOfLines={1}
                  >
                    {celeb.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" }}
          />
          <Text style={{ color: "#666", marginHorizontal: 12, fontSize: 12 }}>
            or use your own photo
          </Text>
          <View
            style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" }}
          />
        </View>

        {/* Image preview */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          {localImage ? (
            <Image
              testID="head-preview-image"
              source={{ uri: localImage }}
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                borderWidth: 3,
                borderColor: "#FFD700",
              }}
            />
          ) : (
            <View
              testID="head-preview-placeholder"
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                borderWidth: 2,
                borderColor: "#666",
                borderStyle: "dashed",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <Text style={{ color: "#999", fontSize: 14 }}>No Photo</Text>
            </View>
          )}
        </View>

        {/* Pick buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Pressable
            testID="gallery-button"
            onPress={handlePickGallery}
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Gallery</Text>
          </Pressable>
          <Pressable
            testID="camera-button"
            onPress={handlePickCamera}
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Camera</Text>
          </Pressable>
        </View>

        {/* Remove BG button */}
        {localImage && (
          <Pressable
            testID="remove-bg-button"
            onPress={handleRemoveBg}
            disabled={removingBg}
            style={{
              alignSelf: "center",
              backgroundColor: "#FF69B4",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
              opacity: removingBg ? 0.6 : 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            {removingBg && (
              <ActivityIndicator
                testID="remove-bg-loading"
                size="small"
                color="#fff"
              />
            )}
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {removingBg ? "Removing..." : "Remove Background"}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Bottom bar */}
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
          testID="next-button"
          disabled={!canProceed}
          accessibilityState={{ disabled: !canProceed }}
          onPress={() => router.push("/create/step2")}
          style={{
            backgroundColor: canProceed ? "#FFD700" : "#555",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: canProceed ? "#1a1a2e" : "#999",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Next
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
