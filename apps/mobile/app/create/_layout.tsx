import { Stack } from "expo-router";
import { CompositionProvider } from "@/context/CompositionContext";

export default function CreateLayout() {
  return (
    <CompositionProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#1a1a2e" },
          animation: "slide_from_right",
        }}
      />
    </CompositionProvider>
  );
}
