// Convex client configuration
import { ConvexHttpClient } from "convex/browser";

export const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? "";

// Lazy-initialized imperative client for repository layer.
// Deferred so tests can mock before instantiation and empty URL doesn't throw at import time.
let _client: ConvexHttpClient | null = null;

function getClient(): ConvexHttpClient {
  if (!_client) {
    _client = new ConvexHttpClient(CONVEX_URL);
  }
  return _client;
}

export const convexClient: ConvexHttpClient = new Proxy({} as ConvexHttpClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    // Bind methods so `this` points to the real client
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// Re-export generated API for type-safe function references
export { api } from "../../convex/_generated/api";

// Re-export for ConvexProvider in _layout.tsx
export { ConvexProvider, ConvexReactClient } from "convex/react";
