import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useComposition } from "@/context/CompositionContext";
import { AnimatedCardPreview } from "@/components/AnimatedCardPreview";
import { LetterAvatar } from "@/components/LetterAvatar";
import { PRESETS } from "@/lib/presets";
import { Colors } from "@/lib/colors";
import { pickImageFromGallery, pickImageFromCamera, cropToSquare } from "@/hooks/useImagePicker";
import { removeBackground } from "@/hooks/useRemoveBg";
import { listCelebrityHeads } from "@/repositories/assets";
import { lightTap } from "@/lib/haptics";
import type {
  PresetId,
  HueColor,
  HeadAnimationType,
  FontStyle,
  FlowerType,
  TextAnimation,
  CelebrityHead,
} from "@/types";

type EditorTab = "templates" | "head" | "text" | "style" | "effects";

const TABS: { id: EditorTab; label: string }[] = [
  { id: "templates", label: "Templates" },
  { id: "head", label: "Head" },
  { id: "text", label: "Text" },
  { id: "style", label: "Style" },
  { id: "effects", label: "Effects" },
];

const HUE_COLORS: HueColor[] = [
  "#FFD700", "#FF69B4", "#00C853", "#2196F3", "#F5A623", "none",
];

const HEAD_ANIMATIONS: { id: HeadAnimationType; label: string }[] = [
  { id: "pop", label: "Pop" },
  { id: "zoom-pulse", label: "Zoom Pulse" },
  { id: "spiral-multiply", label: "Spiral" },
  { id: "float", label: "Float" },
];

const FONTS: { id: FontStyle; label: string }[] = [
  { id: "psychedelic", label: "Psychedelic" },
  { id: "classic", label: "Classic" },
  { id: "bollywood", label: "Bollywood" },
  { id: "clean", label: "Clean" },
  { id: "trucker-art", label: "Trucker" },
];

const FLOWER_TYPES: FlowerType[] = ["rose", "sunflower", "lotus"];

const GREETING_OPTIONS: { label: string; text: string }[] = [
  { label: "Eid Mubarak!", text: "Eid Mubarak!" },
  { label: "Eid ul-Fitr Mubarak", text: "Eid ul-Fitr Mubarak" },
  { label: "Khair Mubarak", text: "Khair Mubarak" },
  { label: "Chand Raat Mubarak", text: "Chand Raat Mubarak" },
  { label: "May Allah bless you", text: "May Allah bless you" },
  { label: "Wishing you joy", text: "Wishing you joy and blessings" },
  { label: "From our family", text: "From our family to yours" },
];

const SUBTITLE_OPTIONS: { label: string; text: string }[] = [
  { label: "Joy & blessings", text: "Wishing you joy and blessings" },
  { label: "Peace & love", text: "Peace, love, and happiness" },
  { label: "Family to yours", text: "From our family to yours" },
  { label: "Blessed Eid", text: "Have a blessed Eid" },
  { label: "Celebrate together", text: "Let's celebrate together!" },
];

const TEXT_ANIMATIONS: { id: TextAnimation; label: string }[] = [
  { id: "fade-in", label: "Fade In" },
  { id: "rise-up", label: "Rise Up" },
  { id: "typewriter", label: "Typewriter" },
  { id: "float", label: "Float" },
];

const MY_PHOTO_ID = "__my-photo__";

export default function EditorScreen() {
  const router = useRouter();
  const { presetId: paramPresetId } = useLocalSearchParams<{ presetId?: string }>();
  const {
    state,
    selectPreset,
    setHeadImage,
    updateTextSlot,
    setHueColor,
    setHueAnimation,
    setHeadAnimation,
    toggleFlowerReveal,
    setTextFont,
    setTextAnimation,
  } = useComposition();

  const [activeTab, setActiveTab] = useState<EditorTab>("templates");
  const [localImage, setLocalImage] = useState<string | null>(
    state.composition.head.imageUrl || null,
  );
  const [removingBg, setRemovingBg] = useState(false);
  const [celebHeads, setCelebHeads] = useState<CelebrityHead[]>([]);
  const [selectedHeadId, setSelectedHeadId] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState<Record<string, boolean>>({});

  const { composition } = state;
  const { width: screenWidth } = useWindowDimensions();
  const previewWidth = Math.round(screenWidth * 0.55);
  const previewHeight = Math.round(previewWidth * (16 / 9));

  useEffect(() => {
    listCelebrityHeads().then(setCelebHeads).catch(() => {});
  }, []);

  useEffect(() => {
    if (paramPresetId && paramPresetId !== state.selectedPresetId) {
      selectPreset(paramPresetId as PresetId);
    }
  }, [paramPresetId]);

  const isMyPhoto = selectedHeadId === MY_PHOTO_ID;

  const handleSelectCeleb = (celeb: CelebrityHead) => {
    lightTap();
    setSelectedHeadId(celeb.id);
    setLocalImage(celeb.imageUrl);
    setHeadImage(celeb.imageUrl);
  };

  const handleSelectMyPhoto = () => {
    if (selectedHeadId !== MY_PHOTO_ID) {
      setLocalImage(null);
      setHeadImage("");
    }
    setSelectedHeadId(MY_PHOTO_ID);
  };

  const handlePickGallery = async () => {
    const result = await pickImageFromGallery();
    if (result) {
      const cropped = await cropToSquare(result.uri, result.width, result.height);
      setLocalImage(cropped);
      setHeadImage(cropped);
    }
  };

  const handlePickCamera = async () => {
    const result = await pickImageFromCamera();
    if (result) {
      const cropped = await cropToSquare(result.uri, result.width, result.height);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Pressable testID="back-button" onPress={() => router.back()}>
            <Text style={{ color: Colors.gold, fontSize: 16, fontWeight: "600" }}>
              Back
            </Text>
          </Pressable>
          <Text style={{ color: Colors.textPrimary, fontSize: 17, fontWeight: "bold" }}>
            Editor
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Live preview — top ~50% */}
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
          <AnimatedCardPreview
            composition={composition}
            size={{ width: previewWidth, height: previewHeight }}
          />
        </View>

        {/* Tab bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle }}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                testID={`tab-${tab.id}`}
                onPress={() => { lightTap(); setActiveTab(tab.id); }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? Colors.gold : "transparent",
                }}
              >
                <Text
                  style={{
                    color: isActive ? Colors.gold : Colors.textMuted,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Tab content — bottom ~45% */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Templates Tab */}
          {activeTab === "templates" && (
            <View>
              <Text style={sectionLabel}>Choose a Template</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRESETS.map((preset) => {
                  const isSelected = state.selectedPresetId === preset.id;
                  const hueColor = preset.defaultProps.hue.color === "none" ? "#666" : preset.defaultProps.hue.color;
                  return (
                    <Pressable
                      key={preset.id}
                      testID={
                        isSelected
                          ? `preset-card-${preset.id}-selected`
                          : `preset-card-${preset.id}`
                      }
                      onPress={() => { lightTap(); selectPreset(preset.id); }}
                      style={{
                        width: 120,
                        marginRight: 12,
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: isSelected ? Colors.goldMuted : Colors.bgSurface,
                        borderWidth: 2,
                        borderColor: isSelected ? Colors.gold : "transparent",
                      }}
                    >
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
                        style={{ fontSize: 13, fontWeight: "bold", color: Colors.textPrimary, marginBottom: 4 }}
                        numberOfLines={1}
                      >
                        {preset.name}
                      </Text>
                      <Text
                        style={{ fontSize: 11, color: Colors.textMuted }}
                        numberOfLines={2}
                      >
                        {preset.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Head Tab */}
          {activeTab === "head" && (
            <View>
              <Text style={sectionLabel}>Choose a Head</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                {/* My Photo option */}
                <Pressable
                  testID="head-option-my-photo"
                  onPress={handleSelectMyPhoto}
                  style={{ alignItems: "center", marginRight: 14, width: 80 }}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      borderWidth: 3,
                      borderColor: isMyPhoto ? Colors.gold : Colors.borderSubtle,
                      backgroundColor: isMyPhoto ? Colors.goldMuted : Colors.bgSurface,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isMyPhoto && localImage ? (
                      <Image
                        source={{ uri: localImage }}
                        style={{ width: 58, height: 58, borderRadius: 29 }}
                      />
                    ) : (
                      <Text style={{ fontSize: 24, color: isMyPhoto ? Colors.gold : Colors.textMuted }}>
                        +
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      color: isMyPhoto ? Colors.gold : Colors.textSecondary,
                      fontSize: 11,
                      marginTop: 4,
                      textAlign: "center",
                      fontWeight: isMyPhoto ? "bold" : "normal",
                    }}
                    numberOfLines={1}
                  >
                    My Photo
                  </Text>
                </Pressable>

                {/* Celebrity heads with LetterAvatar fallback */}
                {celebHeads.map((celeb) => {
                  const isSelected = selectedHeadId === celeb.id;
                  return (
                    <Pressable
                      key={celeb.id}
                      testID={`celeb-head-${celeb.id}`}
                      onPress={() => handleSelectCeleb(celeb)}
                      style={{ alignItems: "center", marginRight: 14, width: 80 }}
                    >
                      <LetterAvatar
                        name={celeb.name}
                        size={64}
                        selected={isSelected}
                      />
                      <Text
                        style={{
                          color: isSelected ? Colors.gold : Colors.textSecondary,
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

              {/* My Photo upload UI */}
              {isMyPhoto && (
                <View testID="my-photo-picker">
                  <View style={{ alignItems: "center", marginBottom: 16 }}>
                    {localImage ? (
                      <Image
                        testID="head-preview-image"
                        source={{ uri: localImage }}
                        style={{
                          width: 140,
                          height: 140,
                          borderRadius: 70,
                          borderWidth: 3,
                          borderColor: Colors.gold,
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
                          borderColor: Colors.textMuted,
                          borderStyle: "dashed",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: Colors.bgSurface,
                        }}
                      >
                        <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
                          Upload a photo
                        </Text>
                      </View>
                    )}
                  </View>

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
                        backgroundColor: Colors.bgSurface,
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: Colors.textPrimary, fontWeight: "600" }}>Gallery</Text>
                    </Pressable>
                    <Pressable
                      testID="camera-button"
                      onPress={handlePickCamera}
                      style={{
                        backgroundColor: Colors.bgSurface,
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: Colors.textPrimary, fontWeight: "600" }}>Camera</Text>
                    </Pressable>
                  </View>

                  {localImage && (
                    <Pressable
                      testID="remove-bg-button"
                      onPress={handleRemoveBg}
                      disabled={removingBg}
                      style={{
                        alignSelf: "center",
                        backgroundColor: Colors.pink,
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
                        <ActivityIndicator testID="remove-bg-loading" size="small" color="#fff" />
                      )}
                      <Text style={{ color: Colors.textPrimary, fontWeight: "600" }}>
                        {removingBg ? "Removing..." : "Remove Background"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Text Tab */}
          {activeTab === "text" && (
            <View>
              {composition.textSlots.map((slot) => {
                const isMain = slot.id === "main" || slot.id === "greeting";
                const options = isMain ? GREETING_OPTIONS : SUBTITLE_OPTIONS;
                const isCustom = customMode[slot.id] ?? false;
                const isPresetMatch = options.some((o) => o.text === slot.text);

                return (
                  <View key={slot.id} style={{ marginBottom: 20 }}>
                    <Text style={sectionLabel}>
                      {isMain ? "Greeting" : slot.id}
                    </Text>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginBottom: 8 }}
                    >
                      {options.map((option) => {
                        const isActive = !isCustom && slot.text === option.text;
                        return (
                          <Pressable
                            key={option.text}
                            testID={`greeting-${slot.id}-${option.label.toLowerCase().replace(/\s+/g, "-")}`}
                            onPress={() => {
                              updateTextSlot(slot.id, option.text);
                              setCustomMode((prev) => ({ ...prev, [slot.id]: false }));
                            }}
                            style={{
                              paddingHorizontal: 14,
                              paddingVertical: 10,
                              borderRadius: 20,
                              marginRight: 8,
                              backgroundColor: isActive ? Colors.goldMuted : Colors.bgSurface,
                              borderWidth: 1,
                              borderColor: isActive ? Colors.gold : "transparent",
                            }}
                          >
                            <Text
                              style={{
                                color: isActive ? Colors.gold : Colors.textSecondary,
                                fontWeight: "600",
                                fontSize: 13,
                              }}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                      <Pressable
                        testID={`greeting-${slot.id}-custom`}
                        onPress={() =>
                          setCustomMode((prev) => ({ ...prev, [slot.id]: true }))
                        }
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderRadius: 20,
                          marginRight: 8,
                          backgroundColor:
                            isCustom || !isPresetMatch ? Colors.goldMuted : Colors.bgSurface,
                          borderWidth: 1,
                          borderColor:
                            isCustom || !isPresetMatch ? Colors.gold : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            color: isCustom || !isPresetMatch ? Colors.gold : Colors.textSecondary,
                            fontWeight: "600",
                            fontSize: 13,
                          }}
                        >
                          Type your own
                        </Text>
                      </Pressable>
                    </ScrollView>

                    {(isCustom || !isPresetMatch) && (
                      <TextInput
                        testID={`text-input-${slot.id}`}
                        value={slot.text}
                        onChangeText={(text) => updateTextSlot(slot.id, text)}
                        style={{
                          backgroundColor: Colors.bgSurface,
                          borderRadius: 10,
                          padding: 12,
                          color: Colors.textPrimary,
                          fontSize: 16,
                          borderWidth: 1,
                          borderColor: Colors.borderSubtle,
                        }}
                        placeholderTextColor={Colors.textDisabled}
                        placeholder="Type your message..."
                      />
                    )}
                  </View>
                );
              })}

              {/* Font picker */}
              <Text style={sectionLabel}>Font Style</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                {FONTS.map((font) => {
                  const isActive = composition.textSlots[0]?.fontFamily === font.id;
                  return (
                    <Pressable
                      key={font.id}
                      testID={`font-${font.id}`}
                      onPress={() => {
                        for (const slot of composition.textSlots) {
                          setTextFont(slot.id, font.id);
                        }
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        marginRight: 8,
                        backgroundColor: isActive ? Colors.goldMuted : Colors.bgSurface,
                        borderWidth: 1,
                        borderColor: isActive ? Colors.gold : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: isActive ? Colors.gold : Colors.textSecondary,
                          fontWeight: "600",
                        }}
                      >
                        {font.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Text animation */}
              <Text style={sectionLabel}>Text Animation</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {TEXT_ANIMATIONS.map((anim) => {
                  const isActive = composition.textSlots[0]?.animation === anim.id;
                  return (
                    <Pressable
                      key={anim.id}
                      testID={`text-anim-${anim.id}`}
                      onPress={() => {
                        for (const slot of composition.textSlots) {
                          setTextAnimation(slot.id, anim.id);
                        }
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        marginRight: 8,
                        backgroundColor: isActive ? Colors.goldMuted : Colors.bgSurface,
                        borderWidth: 1,
                        borderColor: isActive ? Colors.gold : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: isActive ? Colors.gold : Colors.textSecondary,
                          fontWeight: "600",
                        }}
                      >
                        {anim.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Style Tab */}
          {activeTab === "style" && (
            <View>
              <Text style={sectionLabel}>Hue Color</Text>
              <View
                style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 }}
              >
                {HUE_COLORS.map((color) => {
                  const isActive = composition.hue.color === color;
                  return (
                    <Pressable
                      key={color}
                      testID={
                        isActive
                          ? `hue-swatch-${color}-selected`
                          : `hue-swatch-${color}`
                      }
                      onPress={() => setHueColor(color)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: color === "none" ? "#444" : color,
                        borderWidth: 3,
                        borderColor: isActive ? Colors.textPrimary : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {color === "none" && (
                        <Text style={{ color: Colors.textMuted, fontSize: 10 }}>Off</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <Text style={sectionLabel}>Hue Animation</Text>
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                {(["pulse", "static"] as const).map((anim) => {
                  const isActive = composition.hue.animation === anim;
                  return (
                    <Pressable
                      key={anim}
                      testID={`hue-anim-${anim}`}
                      onPress={() => setHueAnimation(anim)}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: isActive ? Colors.goldMuted : Colors.bgSurface,
                        borderWidth: 1,
                        borderColor: isActive ? Colors.gold : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: isActive ? Colors.gold : Colors.textSecondary,
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {anim}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Effects Tab */}
          {activeTab === "effects" && (
            <View>
              <Text style={sectionLabel}>Head Animation</Text>
              <View
                style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}
              >
                {HEAD_ANIMATIONS.map((anim) => {
                  const isActive = composition.head.animation === anim.id;
                  return (
                    <Pressable
                      key={anim.id}
                      testID={`head-anim-${anim.id}`}
                      onPress={() => setHeadAnimation(anim.id)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: isActive ? Colors.goldMuted : Colors.bgSurface,
                        borderWidth: 1,
                        borderColor: isActive ? Colors.gold : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: isActive ? Colors.gold : Colors.textSecondary,
                          fontWeight: "600",
                        }}
                      >
                        {anim.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={sectionLabel}>Flower Reveal</Text>
              <Pressable
                testID="flower-reveal-toggle"
                onPress={() => {
                  const current = composition.head.flowerReveal?.enabled ?? false;
                  const currentType = composition.head.flowerReveal?.type ?? "rose";
                  toggleFlowerReveal(!current, currentType);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: composition.head.flowerReveal?.enabled
                      ? Colors.gold
                      : Colors.textDisabled,
                    justifyContent: "center",
                    paddingHorizontal: 2,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: Colors.textPrimary,
                      alignSelf: composition.head.flowerReveal?.enabled
                        ? "flex-end"
                        : "flex-start",
                    }}
                  />
                </View>
                <Text style={{ color: Colors.textSecondary, fontWeight: "600" }}>
                  {composition.head.flowerReveal?.enabled ? "Enabled" : "Disabled"}
                </Text>
              </Pressable>

              {composition.head.flowerReveal?.enabled && (
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
                  {FLOWER_TYPES.map((type) => {
                    const isActive = composition.head.flowerReveal?.type === type;
                    return (
                      <Pressable
                        key={type}
                        testID={`flower-type-${type}`}
                        onPress={() => toggleFlowerReveal(true, type)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 8,
                          backgroundColor: isActive ? Colors.goldMuted : Colors.bgSurface,
                          borderWidth: 1,
                          borderColor: isActive ? Colors.gold : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            color: isActive ? Colors.gold : Colors.textSecondary,
                            fontWeight: "600",
                            textTransform: "capitalize",
                          }}
                        >
                          {type}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom CTA bar */}
        <View
          style={{
            padding: 16,
            paddingBottom: 24,
            borderTopWidth: 1,
            borderTopColor: Colors.borderSubtle,
          }}
        >
          <Pressable
            testID="send-vibes-button"
            onPress={() => router.push("/create/step3")}
            style={{
              backgroundColor: Colors.gold,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: Colors.bgPrimary, fontSize: 18, fontWeight: "bold" }}>
              Send Vibes
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const sectionLabel = {
  color: Colors.textMuted,
  fontSize: 12,
  marginBottom: 8,
  textTransform: "uppercase" as const,
  letterSpacing: 1,
  fontWeight: "600" as const,
};
