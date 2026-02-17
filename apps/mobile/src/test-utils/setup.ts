// Global test setup for React Native Testing Library
// Extend expect matchers will be available through jest-expo preset

// Mock react-native-mmkv (native module not available in test env)
jest.mock("react-native-mmkv", () => {
  const store = new Map<string, string | number | boolean>();
  return {
    createMMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store.get(key) as string | undefined,
      set: (key: string, value: string | number | boolean) =>
        store.set(key, value),
      remove: (key: string) => store.delete(key),
      contains: (key: string) => store.has(key),
      clearAll: () => store.clear(),
    })),
  };
});
