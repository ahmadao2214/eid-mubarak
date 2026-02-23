// Global test setup for React Native Testing Library
// Extend expect matchers will be available through jest-expo preset

require("react-native-reanimated").setUpTests();

process.env.EXPO_PUBLIC_PREVIEW_URL = "https://preview.test.example.com";
