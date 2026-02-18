import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a2e" }}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* Header row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#FFD700",
            }}
          >
            Eid Mubarak!
          </Text>
          <Pressable
            testID="my-cards-button"
            onPress={() => router.push("/saved")}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#FFD700",
              }}
            >
              My Cards
            </Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 16, color: "#e0e0e0", marginBottom: 24 }}>
          Create cheesy Eid video cards with maximum aunty energy
        </Text>

        {/* Create CTA */}
        <Pressable
          testID="create-new-card"
          onPress={() => router.push("/create/step1")}
          style={{
            backgroundColor: "#FFD700",
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1a1a2e" }}>
            Create New Card
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
