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
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useComposition } from "@/context/CompositionContext";
import { RemotionPreview } from "@/components/RemotionPreview";
import { TemplateCard } from "@/components/TemplateCard";
import { PRESETS } from "@/lib/presets";
import { splitGreeting } from "@/lib/text-split";
import { Colors } from "@/lib/colors";
import { pickImageFromGallery, pickImageFromCamera, cropToSquare } from "@/hooks/useImagePicker";
import { removeBackgroundFromImage } from "@/hooks/useRemoveBg";
import { useAssetsByType, useCelebrityHeads } from "@/hooks/useConvexData";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import { getHeadFilenameFromUrl } from "@/lib/head-assets";
import { lightTap } from "@/lib/haptics";
import type {
  PresetId,
  HueColor,
  HeadAnimationType,
  FontStyle,
  FlowerType,
  TextAnimation,
  CelebrityHead,
  Asset,
} from "@/types";

type EditorTab = "templates" | "head" | "background" | "text" | "style" | "effects";

const TABS: { id: EditorTab; label: string }[] = [
  { id: "templates", label: "Templates" },
  { id: "head", label: "Head" },
  { id: "background", label: "Background" },
  { id: "text", label: "Text" },
  { id: "style", label: "Style" },
  { id: "effects", label: "Effects" },
];

const HUE_COLORS: HueColor[] = [
  "#FFD700", "#FF69B4", "#00C853", "#2196F3", "#F5A623", "none",
];

// Bundled head images by filename — require() must be static for Metro. Key = lowercase filename.
const HEAD_IMAGES_BY_FILENAME: Record<string, ReturnType<typeof require>> = {
  "zohran.png": require("../../assets/heads/zohran.png"),
  "central-cee.png": require("../../assets/heads/central-cee.png"),
  "drak-hijab.png": require("../../assets/heads/drak-hijab.png"),
  "mufti.png": require("../../assets/heads/mufti.png"),
  "onijah-robinson.png": require("../../assets/heads/onijah-robinson.png"),
  "sehad-kamran.png": require("../../assets/heads/sehad-kamran.png"),
  "srk.jpg": require("../../assets/heads/srk.jpg"),
};

/** Head tile — uses bundled asset by filename (case-insensitive) from S3 URL, else presigned URL. */
function CelebHeadTile({
  celeb,
  isSelected,
  headCellWidth,
  onPress,
}: {
  celeb: CelebrityHead;
  isSelected: boolean;
  headCellWidth: number;
  onPress: () => void;
}) {
  const filename = getHeadFilenameFromUrl(celeb.imageUrl);
  const bundled = filename ? HEAD_IMAGES_BY_FILENAME[filename] : null;
  const resolvedUri = useResolvedImageUrl(bundled ? undefined : (celeb.thumbnail ?? celeb.imageUrl));
  const source = bundled ?? (resolvedUri ? { uri: resolvedUri } : { uri: celeb.imageUrl });

  return (
    <Pressable
      testID={`celeb-head-${celeb.id}`}
      onPress={onPress}
      style={{ alignItems: "center", width: headCellWidth }}
    >
      <View
        style={{
          width: headCellWidth - 8,
          height: headCellWidth - 8,
          borderRadius: (headCellWidth - 8) / 2,
          borderWidth: 3,
          borderColor: isSelected ? Colors.gold : Colors.borderSubtle,
          overflow: "hidden",
        }}
      >
        <Image
          source={source}
          style={{
            width: headCellWidth - 14,
            height: headCellWidth - 14,
            borderRadius: (headCellWidth - 14) / 2,
          }}
          resizeMode="cover"
        />
      </View>
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
}

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

const TEXT_COLORS: { label: string; value: string }[] = [
  { label: "White", value: "#FFFFFF" },
  { label: "Cream", value: "#FAF3E0" },
  { label: "Gold", value: "#D4A843" },
  { label: "Pink", value: "#E87BA4" },
  { label: "Green", value: "#2ECC71" },
  { label: "Blue", value: "#2196F3" },
  { label: "Red", value: "#E74C3C" },
  { label: "Black", value: "#1A1A1A" },
];

const MY_PHOTO_ID = "__my-photo__";

export default function EditorScreen() {
  const router = useRouter();
  const { presetId: paramPresetId } = useLocalSearchParams<{ presetId?: string }>();
  const {
    state,
    selectPreset,
    setHeadImage,
    setBackground,
    updateTextSlot,
    setHueColor,
    setHueAnimation,
    setHeadAnimation,
    toggleFlowerReveal,
    setTextFont,
    setTextAnimation,
    setTextColor,
    updateGroupedText,
  } = useComposition();

  const [activeTab, setActiveTab] = useState<EditorTab>("templates");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [removingBg, setRemovingBg] = useState(false);
  const celebHeads = useCelebrityHeads();
  const backgroundAssets = useAssetsByType("background").filter(
    (asset) => asset.type === "background-image",
  ) as Asset[];
  const [selectedHeadId, setSelectedHeadId] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState<Record<string, boolean>>({});

  const { composition } = state;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // Constrain preview by screen HEIGHT (~45%), then derive width from 9:16 ratio
  const maxPreviewHeight = Math.round(screenHeight * 0.45);
  const previewWidth = Math.min(
    Math.round(maxPreviewHeight * (9 / 16)),
    screenWidth - 32,
  );
  const previewHeight = Math.round(previewWidth * (16 / 9));
  const templateColumns = 2;
  const templateGap = 10;
  const templateCardWidth = Math.floor(
    (screenWidth - 32 - templateGap * (templateColumns - 1)) / templateColumns,
  );
  const headColumns = 4;
  const headGap = 12;
  const headCellWidth = Math.floor(
    (screenWidth - 32 - headGap * (headColumns - 1)) / headColumns,
  );
  const backgroundColumns = 2;
  const backgroundGap = 12;
  const backgroundCellWidth = Math.floor(
    (screenWidth - 32 - backgroundGap * (backgroundColumns - 1)) / backgroundColumns,
  );
  const selectedBackgroundSource = composition.background.source;

  useEffect(() => {
    if (paramPresetId && paramPresetId !== state.selectedPresetId) {
      selectPreset(paramPresetId as PresetId);
    }
  }, [paramPresetId]);

  // Sync head picker selection when template changes (highlight which head is selected)
  // Do NOT overwrite /assets/ paths with S3 URLs — /assets/ loads in WebView; S3 may not.
  useEffect(() => {
    const headUrl = composition.head.imageUrl;
    if (!headUrl) {
      setSelectedHeadId(null);
      return;
    }
    const filename = getHeadFilenameFromUrl(headUrl);
    const match = filename
      ? celebHeads.find((celeb) => getHeadFilenameFromUrl(celeb.imageUrl) === filename)
      : null;
    if (match) {
      setSelectedHeadId(match.id);
    }
  }, [state.selectedPresetId, celebHeads.length, composition.head.imageUrl]);

  const isMyPhoto = selectedHeadId === MY_PHOTO_ID;

  const handleSelectCeleb = (celeb: CelebrityHead) => {
    lightTap();
    setSelectedHeadId(celeb.id);
    setHeadImage(celeb.imageUrl);
  };

  const handleSelectMyPhoto = () => {
    lightTap();
    setSelectedHeadId(MY_PHOTO_ID);
    if (userPhoto) {
      setHeadImage(userPhoto);
    }
  };

  /** Remove background from local image; Convex uploads only the result to S3. No upload before. */
  const removeBgThenSetPhoto = async (localUri: string) => {
    setRemovingBg(true);
    try {
      const result = await removeBackgroundFromImage(localUri);
      if (result.success && result.transparentUrl) {
        setUserPhoto(result.transparentUrl);
        setHeadImage(result.transparentUrl);
      } else if (!result.success) {
        Alert.alert("Background Removal Failed", result.error ?? "Could not remove background");
      }
    } finally {
      setRemovingBg(false);
    }
  };

  const handleSelectBackground = (asset: Asset) => {
    lightTap();
    const next = {
      type: "image" as const,
      source: asset.url,
      animation: composition.background.animation ?? "slow-zoom",
    };
    setBackground(next);
  };

  const handlePickGallery = async () => {
    const result = await pickImageFromGallery();
    if (result) {
      const cropped = await cropToSquare(result.uri, result.width, result.height);
      setUserPhoto(cropped);
      setHeadImage(cropped);
      await removeBgThenSetPhoto(cropped);
    }
  };

  const handlePickCamera = async () => {
    const result = await pickImageFromCamera();
    if (result) {
      const cropped = await cropToSquare(result.uri, result.width, result.height);
      setUserPhoto(cropped);
      setHeadImage(cropped);
      await removeBgThenSetPhoto(cropped);
    }
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
          <RemotionPreview
            composition={composition}
            width={previewWidth}
            height={previewHeight}
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
          {/* Templates Tab — 2-column grid */}
          {activeTab === "templates" && (
            <View>
              <Text style={sectionLabel}>Choose a Template</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: templateGap,
                }}
              >
                {PRESETS.map((preset) => (
                  <TemplateCard
                    key={preset.id}
                    preset={preset}
                    onPress={() => { lightTap(); selectPreset(preset.id); }}
                    selected={state.selectedPresetId === preset.id}
                    width={templateCardWidth}
                    testID={`preset-card-${preset.id}`}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Head Tab — vertical grid, 4 per row */}
          {activeTab === "head" && (
            <View>
              <Text style={sectionLabel}>Choose a Head</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: headGap,
                  marginBottom: 16,
                }}
              >
                {/* My Photo option — always shows uploaded image if available */}
                <Pressable
                  testID="head-option-my-photo"
                  onPress={handleSelectMyPhoto}
                  style={{ alignItems: "center", width: headCellWidth }}
                >
                  <View
                    style={{
                      width: headCellWidth - 8,
                      height: headCellWidth - 8,
                      borderRadius: (headCellWidth - 8) / 2,
                      borderWidth: 3,
                      borderColor: isMyPhoto ? Colors.gold : Colors.borderSubtle,
                      backgroundColor: Colors.bgSurface,
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    {userPhoto ? (
                      <Image
                        source={{ uri: userPhoto }}
                        style={{
                          width: headCellWidth - 14,
                          height: headCellWidth - 14,
                          borderRadius: (headCellWidth - 14) / 2,
                        }}
                        resizeMode="cover"
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
                    {userPhoto ? "My Photo" : "Add Photo"}
                  </Text>
                </Pressable>

                {/* Celebrity heads with real images (resolved for private S3) */}
                {celebHeads.map((celeb) => (
                  <CelebHeadTile
                    key={celeb.id}
                    celeb={celeb}
                    isSelected={selectedHeadId === celeb.id}
                    headCellWidth={headCellWidth}
                    onPress={() => handleSelectCeleb(celeb)}
                  />
                ))}
              </View>

              {/* My Photo upload UI */}
              {isMyPhoto && (
                <View testID="my-photo-picker">
                  <View style={{ alignItems: "center", marginBottom: 16 }}>
                    {userPhoto ? (
                      <Image
                        testID="head-preview-image"
                        source={{ uri: userPhoto }}
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

                  {removingBg && (
                    <View style={{ alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <ActivityIndicator testID="remove-bg-loading" size="small" color={Colors.gold} />
                      <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>Uploading & removing background...</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Background Tab — preset S3 backgrounds */}
          {activeTab === "background" && (
            <View>
              <Text style={sectionLabel}>Choose a Background</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: backgroundGap,
                  marginBottom: 16,
                }}
              >
                {backgroundAssets.map((asset) => {
                  const isSelected = selectedBackgroundSource === asset.url;
                  return (
                    <Pressable
                      key={asset.id}
                      testID={`background-${asset.id}`}
                      onPress={() => handleSelectBackground(asset)}
                      style={{ width: backgroundCellWidth }}
                    >
                      <View
                        style={{
                          width: backgroundCellWidth,
                          height: Math.round(backgroundCellWidth * (9 / 16)),
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: isSelected ? Colors.gold : Colors.borderSubtle,
                          overflow: "hidden",
                          backgroundColor: Colors.bgSurface,
                        }}
                      >
                        <Image
                          source={{ uri: asset.url }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      </View>
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
                        {asset.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Text Tab */}
          {activeTab === "text" && (
            <View>
              {(() => {
                // Collect groups: grouped slots share one editor, ungrouped get individual editors
                const groups = new Map<string, typeof composition.textSlots>();
                const ungrouped: typeof composition.textSlots = [];
                for (const slot of composition.textSlots) {
                  if (slot.group) {
                    if (!groups.has(slot.group)) groups.set(slot.group, []);
                    groups.get(slot.group)!.push(slot);
                  } else {
                    ungrouped.push(slot);
                  }
                }

                const renderSlotEditor = (slot: typeof composition.textSlots[0]) => {
                  const isMain = slot.id === "main" || slot.id === "greeting";
                  const options = isMain ? GREETING_OPTIONS : SUBTITLE_OPTIONS;
                  const isCustom = customMode[slot.id] ?? false;
                  const isPresetMatch = options.some((o) => o.text === slot.text);

                  return (
                    <View key={slot.id} style={{ marginBottom: 20 }}>
                      <Text style={sectionLabel}>
                        {isMain ? "Greeting" : slot.id}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
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
                                paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                                backgroundColor: isActive ? Colors.goldMuted : Colors.bgSurface,
                                borderWidth: 1, borderColor: isActive ? Colors.gold : "transparent",
                              }}
                            >
                              <Text style={{ color: isActive ? Colors.gold : Colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
                                {option.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                        <Pressable
                          testID={`greeting-${slot.id}-custom`}
                          onPress={() => setCustomMode((prev) => ({ ...prev, [slot.id]: true }))}
                          style={{
                            paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                            backgroundColor: isCustom || !isPresetMatch ? Colors.goldMuted : Colors.bgSurface,
                            borderWidth: 1, borderColor: isCustom || !isPresetMatch ? Colors.gold : "transparent",
                          }}
                        >
                          <Text style={{ color: isCustom || !isPresetMatch ? Colors.gold : Colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
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
                            backgroundColor: Colors.bgSurface, borderRadius: 10, padding: 12,
                            color: Colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: Colors.borderSubtle,
                          }}
                          placeholderTextColor={Colors.textDisabled}
                          placeholder="Type your message..."
                        />
                      )}
                    </View>
                  );
                };

                const renderGroupEditor = (group: string, slots: typeof composition.textSlots) => {
                  // Reconstruct the original greeting from slot texts
                  const currentGreeting = slots.map((s) => s.text).join(" ");
                  const isCustom = customMode[group] ?? false;
                  const isPresetMatch = GREETING_OPTIONS.some((o) => o.text.toUpperCase() === currentGreeting);

                  const handleGroupChange = (text: string) => {
                    const parts = splitGreeting(text);
                    updateGroupedText(group, parts);
                  };

                  return (
                    <View key={group} style={{ marginBottom: 20 }}>
                      <Text style={sectionLabel}>Greeting</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                        {GREETING_OPTIONS.map((option) => {
                          const parts = splitGreeting(option.text);
                          const isActive = !isCustom && slots.every((s, i) => s.text === (parts[i] ?? ""));
                          return (
                            <Pressable
                              key={option.text}
                              testID={`greeting-group-${option.label.toLowerCase().replace(/\s+/g, "-")}`}
                              onPress={() => {
                                updateGroupedText(group, parts);
                                setCustomMode((prev) => ({ ...prev, [group]: false }));
                              }}
                              style={{
                                paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                                backgroundColor: isActive ? Colors.goldMuted : Colors.bgSurface,
                                borderWidth: 1, borderColor: isActive ? Colors.gold : "transparent",
                              }}
                            >
                              <Text style={{ color: isActive ? Colors.gold : Colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
                                {option.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                        <Pressable
                          testID={`greeting-group-custom`}
                          onPress={() => setCustomMode((prev) => ({ ...prev, [group]: true }))}
                          style={{
                            paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginRight: 8,
                            backgroundColor: isCustom || !isPresetMatch ? Colors.goldMuted : Colors.bgSurface,
                            borderWidth: 1, borderColor: isCustom || !isPresetMatch ? Colors.gold : "transparent",
                          }}
                        >
                          <Text style={{ color: isCustom || !isPresetMatch ? Colors.gold : Colors.textSecondary, fontWeight: "600", fontSize: 13 }}>
                            Type your own
                          </Text>
                        </Pressable>
                      </ScrollView>
                      {(isCustom || !isPresetMatch) && (
                        <TextInput
                          testID={`text-input-group-${group}`}
                          value={currentGreeting}
                          onChangeText={handleGroupChange}
                          style={{
                            backgroundColor: Colors.bgSurface, borderRadius: 10, padding: 12,
                            color: Colors.textPrimary, fontSize: 16, borderWidth: 1, borderColor: Colors.borderSubtle,
                          }}
                          placeholderTextColor={Colors.textDisabled}
                          placeholder="Type your greeting..."
                        />
                      )}
                    </View>
                  );
                };

                return (
                  <>
                    {Array.from(groups.entries()).map(([group, slots]) =>
                      renderGroupEditor(group, slots),
                    )}
                    {ungrouped.map((slot) => renderSlotEditor(slot))}
                  </>
                );
              })()}

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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
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

              {/* Text color */}
              <Text style={sectionLabel}>Text Color</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {TEXT_COLORS.map((tc) => {
                  const isActive = composition.textSlots[0]?.color === tc.value;
                  return (
                    <Pressable
                      key={tc.value}
                      testID={`text-color-${tc.label.toLowerCase()}`}
                      onPress={() => {
                        for (const slot of composition.textSlots) {
                          setTextColor(slot.id, tc.value);
                        }
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: tc.value,
                        borderWidth: 3,
                        borderColor: isActive ? Colors.gold : Colors.borderSubtle,
                      }}
                    />
                  );
                })}
              </View>
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
                {(["pulse", "static", "cycle"] as const).map((anim) => {
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
