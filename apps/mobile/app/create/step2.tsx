import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useComposition } from "@/context/CompositionContext";
import { AnimatedCardPreview } from "@/components/AnimatedCardPreview";
import { lightTap } from "@/lib/haptics";
import type {
  HueColor,
  HeadAnimationType,
  FontStyle,
  FlowerType,
  TextAnimation,
} from "@/types";

type Tab = "text" | "style" | "effects";

const HUE_COLORS: HueColor[] = [
  "#FFD700",
  "#FF69B4",
  "#00C853",
  "#2196F3",
  "#F5A623",
  "none",
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

export default function Step2Screen() {
  const router = useRouter();
  const {
    state,
    updateTextSlot,
    setHueColor,
    setHueAnimation,
    setHeadAnimation,
    toggleFlowerReveal,
    setTextFont,
    setTextAnimation,
  } = useComposition();
  const [activeTab, setActiveTab] = useState<Tab>("text");
  const [customMode, setCustomMode] = useState<Record<string, boolean>>({});
  const { composition } = state;

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
          Step 2
        </Text>
        <Text style={{ fontSize: 16, color: "#e0e0e0", marginBottom: 16 }}>
          Customize your card
        </Text>

        {/* Preview */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <AnimatedCardPreview composition={composition} size="small" />
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            marginBottom: 20,
            borderRadius: 10,
            backgroundColor: "rgba(255,255,255,0.05)",
            padding: 4,
          }}
        >
          {(["text", "style", "effects"] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              testID={`tab-${tab}`}
              onPress={() => { lightTap(); setActiveTab(tab); }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor:
                  activeTab === tab ? "rgba(255,215,0,0.2)" : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: activeTab === tab ? "#FFD700" : "#999",
                  fontWeight: "600",
                  fontSize: 14,
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Text Tab */}
        {activeTab === "text" && (
          <View>
            {/* Text slot pickers */}
            {composition.textSlots.map((slot) => {
              const isMain = slot.id === "main" || slot.id === "greeting";
              const options = isMain ? GREETING_OPTIONS : SUBTITLE_OPTIONS;
              const isCustom = customMode[slot.id] ?? false;
              const isPresetMatch = options.some((o) => o.text === slot.text);

              return (
                <View key={slot.id} style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      color: "#aaa",
                      fontSize: 12,
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {isMain ? "Greeting" : slot.id}
                  </Text>

                  {/* Preset text options */}
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
                            setCustomMode((prev) => ({
                              ...prev,
                              [slot.id]: false,
                            }));
                          }}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            borderRadius: 20,
                            marginRight: 8,
                            backgroundColor: isActive
                              ? "rgba(255,215,0,0.2)"
                              : "rgba(255,255,255,0.05)",
                            borderWidth: 1,
                            borderColor: isActive ? "#FFD700" : "transparent",
                          }}
                        >
                          <Text
                            style={{
                              color: isActive ? "#FFD700" : "#ccc",
                              fontWeight: "600",
                              fontSize: 13,
                            }}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                    {/* Type your own pill */}
                    <Pressable
                      testID={`greeting-${slot.id}-custom`}
                      onPress={() =>
                        setCustomMode((prev) => ({
                          ...prev,
                          [slot.id]: true,
                        }))
                      }
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 20,
                        marginRight: 8,
                        backgroundColor:
                          isCustom || !isPresetMatch
                            ? "rgba(255,215,0,0.2)"
                            : "rgba(255,255,255,0.05)",
                        borderWidth: 1,
                        borderColor:
                          isCustom || !isPresetMatch
                            ? "#FFD700"
                            : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color:
                            isCustom || !isPresetMatch ? "#FFD700" : "#ccc",
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        Type your own
                      </Text>
                    </Pressable>
                  </ScrollView>

                  {/* Custom text input (shown when "Type your own" selected) */}
                  {(isCustom || !isPresetMatch) && (
                    <TextInput
                      testID={`text-input-${slot.id}`}
                      value={slot.text}
                      onChangeText={(text) => updateTextSlot(slot.id, text)}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        padding: 12,
                        color: "#fff",
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.15)",
                      }}
                      placeholderTextColor="#666"
                      placeholder="Type your message..."
                    />
                  )}
                </View>
              );
            })}

            {/* Font picker */}
            <Text
              style={{
                color: "#aaa",
                fontSize: 12,
                marginBottom: 8,
                marginTop: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Font Style
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              {FONTS.map((font) => {
                const isActive =
                  composition.textSlots[0]?.fontFamily === font.id;
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
                      backgroundColor: isActive
                        ? "rgba(255,215,0,0.2)"
                        : "rgba(255,255,255,0.05)",
                      borderWidth: 1,
                      borderColor: isActive ? "#FFD700" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "#FFD700" : "#ccc",
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
            <Text
              style={{
                color: "#aaa",
                fontSize: 12,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Text Animation
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TEXT_ANIMATIONS.map((anim) => {
                const isActive =
                  composition.textSlots[0]?.animation === anim.id;
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
                      backgroundColor: isActive
                        ? "rgba(255,215,0,0.2)"
                        : "rgba(255,255,255,0.05)",
                      borderWidth: 1,
                      borderColor: isActive ? "#FFD700" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "#FFD700" : "#ccc",
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
            <Text
              style={{
                color: "#aaa",
                fontSize: 12,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Hue Color
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20,
              }}
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
                      borderColor: isActive ? "#fff" : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {color === "none" && (
                      <Text style={{ color: "#999", fontSize: 10 }}>Off</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Hue animation */}
            <Text
              style={{
                color: "#aaa",
                fontSize: 12,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Hue Animation
            </Text>
            <View
              style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}
            >
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
                      backgroundColor: isActive
                        ? "rgba(255,215,0,0.2)"
                        : "rgba(255,255,255,0.05)",
                      borderWidth: 1,
                      borderColor: isActive ? "#FFD700" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "#FFD700" : "#ccc",
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
            {/* Head animation */}
            <Text
              style={{
                color: "#aaa",
                fontSize: 12,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Head Animation
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
              }}
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
                      backgroundColor: isActive
                        ? "rgba(255,215,0,0.2)"
                        : "rgba(255,255,255,0.05)",
                      borderWidth: 1,
                      borderColor: isActive ? "#FFD700" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "#FFD700" : "#ccc",
                        fontWeight: "600",
                      }}
                    >
                      {anim.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Flower reveal */}
            <Text
              style={{
                color: "#aaa",
                fontSize: 12,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Flower Reveal
            </Text>
            <Pressable
              testID="flower-reveal-toggle"
              onPress={() => {
                const current = composition.head.flowerReveal?.enabled ?? false;
                const currentType =
                  composition.head.flowerReveal?.type ?? "rose";
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
                  backgroundColor:
                    composition.head.flowerReveal?.enabled
                      ? "#FFD700"
                      : "#555",
                  justifyContent: "center",
                  paddingHorizontal: 2,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#fff",
                    alignSelf: composition.head.flowerReveal?.enabled
                      ? "flex-end"
                      : "flex-start",
                  }}
                />
              </View>
              <Text style={{ color: "#ccc", fontWeight: "600" }}>
                {composition.head.flowerReveal?.enabled
                  ? "Enabled"
                  : "Disabled"}
              </Text>
            </Pressable>

            {/* Flower type picker */}
            {composition.head.flowerReveal?.enabled && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {FLOWER_TYPES.map((type) => {
                  const isActive =
                    composition.head.flowerReveal?.type === type;
                  return (
                    <Pressable
                      key={type}
                      testID={`flower-type-${type}`}
                      onPress={() => toggleFlowerReveal(true, type)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: isActive
                          ? "rgba(255,215,0,0.2)"
                          : "rgba(255,255,255,0.05)",
                        borderWidth: 1,
                        borderColor: isActive ? "#FFD700" : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: isActive ? "#FFD700" : "#ccc",
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

      {/* Bottom nav */}
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
          flexDirection: "row",
          gap: 12,
        }}
      >
        <Pressable
          testID="back-button"
          onPress={() => router.back()}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#FFD700",
          }}
        >
          <Text style={{ color: "#FFD700", fontSize: 16, fontWeight: "bold" }}>
            Back
          </Text>
        </Pressable>
        <Pressable
          testID="next-button"
          onPress={() => router.push("/create/step3")}
          style={{
            flex: 1,
            backgroundColor: "#FFD700",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{ color: "#1a1a2e", fontSize: 16, fontWeight: "bold" }}
          >
            Next
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
