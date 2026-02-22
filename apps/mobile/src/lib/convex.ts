// Convex client configuration
import { ConvexHttpClient } from "convex/browser";

export const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? "";

// Lazy-initialized imperative client for repository layer.
// Deferred so tests can mock before instantiation and empty URL doesn't throw at import time.
let _client: ConvexHttpClient | null = null;

export const convexClient: ConvexHttpClient = new Proxy({} as ConvexHttpClient, {
  get(_target, prop) {
    if (!_client) {
      _client = new ConvexHttpClient(CONVEX_URL);
    }
    return (_client as any)[prop];
  },
});

// Re-export generated API for type-safe function references
export { api } from "../../convex/_generated/api";

// Re-export for ConvexProvider in _layout.tsx
export { ConvexProvider, ConvexReactClient } from "convex/react";
