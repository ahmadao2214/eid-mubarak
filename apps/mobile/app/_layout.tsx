import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#1a1a2e" },
            animation: "slide_from_right",
          }}
        />
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
