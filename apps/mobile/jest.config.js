/** @type {import('jest').Config} */
const path = require("path");

module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>/src"],
  moduleDirectories: [
    "node_modules",
    path.resolve(__dirname, "node_modules"),
    path.resolve(__dirname, "../../node_modules"),
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    ".*convex/_generated/api$": "<rootDir>/src/__mocks__/convex-api.ts",
    "^expo-sharing$": "<rootDir>/src/__mocks__/expo-sharing.ts",
    "^expo-media-library$": "<rootDir>/src/__mocks__/expo-media-library.ts",
    "^expo-file-system/next$": "<rootDir>/src/__mocks__/expo-file-system-next.ts",
  },
  setupFiles: ["<rootDir>/src/test-utils/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/test-utils/**",
    "!src/__tests__/**",
  ],
};
