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
  },
  setupFiles: ["<rootDir>/src/test-utils/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/test-utils/**",
    "!src/__tests__/**",
  ],
};
