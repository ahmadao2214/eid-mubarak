// Global test setup for React Native Testing Library
// Extend expect matchers will be available through jest-expo preset

require("react-native-reanimated").setUpTests();

process.env.EXPO_PUBLIC_PREVIEW_URL = "https://preview.test.example.com";

// useResolvedImageUrl uses Convex useAction; mock so components that use it don't need ConvexProvider
jest.mock("@/hooks/useResolvedImageUrl", () => ({
  useResolvedImageUrl: (uri: string | null | undefined) => uri ?? null,
}));
