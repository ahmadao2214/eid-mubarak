import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/context/ToastContext";
import { ConvexProvider, ConvexReactClient, CONVEX_URL } from "@/lib/convex";
import { Colors } from "@/lib/colors";

const convex = new ConvexReactClient(CONVEX_URL);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <SafeAreaProvider>
        <GluestackUIProvider>
          <ErrorBoundary>
            <ToastProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bgPrimary },
                animation: "slide_from_right",
              }}
            />
          </ToastProvider>
        </ErrorBoundary>
      </GluestackUIProvider>
    </SafeAreaProvider>
    </ConvexProvider>
  );
}
