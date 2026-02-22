// Convex client configuration
import { ConvexHttpClient } from "convex/browser";

export const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? "";

// Imperative client for repository layer (query/mutation/action calls).
// Created lazily via getter to avoid throwing on empty URL during test imports.
let _httpClient: ConvexHttpClient | null = null;

export function getConvexHttpClient(): ConvexHttpClient {
  if (!_httpClient) {
    console.log("[convex] Creating ConvexHttpClient, URL:", CONVEX_URL ? CONVEX_URL.substring(0, 40) + "..." : "(EMPTY!)");
    _httpClient = new ConvexHttpClient(CONVEX_URL);
  }
  return _httpClient;
}

// Convenience object matching the old convexClient API so repositories don't change.
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
