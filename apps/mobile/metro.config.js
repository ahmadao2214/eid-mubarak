const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Force single React copy in monorepo to avoid "invalid hook call" errors
const mobileModules = path.resolve(__dirname, "node_modules");
config.resolver.extraNodeModules = {
  react: path.resolve(mobileModules, "react"),
  "react-native": path.resolve(mobileModules, "react-native"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
