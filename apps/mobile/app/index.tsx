import React from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TemplateCard } from "@/components/TemplateCard";
import { PRESETS } from "@/lib/presets";
import { Colors } from "@/lib/colors";

export default function HomeScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const gridGap = 12;
  const gridPadding = 16;
  const columns = 2;
  const cardWidth = Math.floor(
    (screenWidth - gridPadding * 2 - gridGap * (columns - 1)) / columns,
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: gridPadding, paddingBottom: 40 }}
      >
        {/* Header row */}
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
              fontSize: 28,
              fontWeight: "bold",
              color: Colors.textPrimary,
              letterSpacing: -0.5,
            }}
          >
            Send Eid Vibes
          </Text>
          <Pressable
            testID="my-vibes-link"
            onPress={() => router.push("/saved")}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: Colors.gold,
              }}
            >
              My Vibes
            </Text>
          </Pressable>
        </View>

        {/* Create CTA */}
        <Pressable
          testID="create-new-card"
          onPress={() => router.push("/create/editor")}
          style={{
            backgroundColor: Colors.gold,
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.bgPrimary }}>
            Create New Card
          </Text>
        </Pressable>

        {/* Templates Grid */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: Colors.textMuted,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Templates
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: gridGap,
          }}
        >
          {PRESETS.map((preset) => (
            <TemplateCard
              key={preset.id}
              preset={preset}
              onPress={() =>
                router.push({
                  pathname: "/create/editor",
                  params: { presetId: preset.id },
                })
              }
              selected={false}
              width={cardWidth}
              testID={`featured-template-${preset.id}`}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
