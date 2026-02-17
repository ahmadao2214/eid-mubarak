// Convex client configuration
// Dev B will provide the real CONVEX_URL after deploying the Convex project
// Until then, this file sets up the provider structure

// TODO: Replace with real Convex URL from Dev B
export const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? "";

// Re-export for convenience
export { ConvexProvider, ConvexReactClient } from "convex/react";
