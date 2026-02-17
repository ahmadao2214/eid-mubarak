import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { ConvexProvider, ConvexReactClient, CONVEX_URL } from "@/lib/convex";

const convex = new ConvexReactClient(CONVEX_URL);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
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
    </ConvexProvider>
  );
}
