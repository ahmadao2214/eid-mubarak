import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Step2Screen() {
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
          Step 2: Customize Your Card
        </Text>
        <Text style={{ fontSize: 16, color: "#e0e0e0", marginTop: 12 }}>
          Background, hue, decorations, text, font — tweak everything.
        </Text>
      </View>
    </SafeAreaView>
  );
}
