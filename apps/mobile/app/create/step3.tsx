import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Step3Screen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a2e" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFD700" }}>
          Step 3: Export & Share
        </Text>
        <Text style={{ fontSize: 16, color: "#e0e0e0", marginTop: 12 }}>
          Render your video and share it on WhatsApp, Instagram, or save to
          camera roll.
        </Text>
      </View>
    </SafeAreaView>
  );
}
