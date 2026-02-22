// Convex client configuration
import { ConvexHttpClient } from "convex/browser";

export const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? "";

// Imperative client used only by the repository layer (test-time mocking).
// Screens should use the React hooks in src/hooks/useConvexData.ts instead,
// which go through the WebSocket-based ConvexReactClient.
let _httpClient: ConvexHttpClient | null = null;

function getConvexHttpClient(): ConvexHttpClient {
  if (!_httpClient) {
    _httpClient = new ConvexHttpClient(CONVEX_URL);
  }
  return _httpClient;
}

export const convexClient = {
  query: (...args: Parameters<ConvexHttpClient["query"]>) =>
    getConvexHttpClient().query(...args),
  mutation: (...args: Parameters<ConvexHttpClient["mutation"]>) =>
    getConvexHttpClient().mutation(...args),
  action: (...args: Parameters<ConvexHttpClient["action"]>) =>
    getConvexHttpClient().action(...args),
};

// Re-export generated API for type-safe function references
export { api } from "../../convex/_generated/api";

// Re-export for ConvexProvider in _layout.tsx
export { ConvexProvider, ConvexReactClient } from "convex/react";
