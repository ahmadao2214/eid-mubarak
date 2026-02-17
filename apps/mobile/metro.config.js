const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

// Monorepo: watch root so Metro sees shared packages (nativewind, etc.)
config.watchFolders = [monorepoRoot];

// Prioritize mobile's node_modules for resolution
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Force ALL react imports (including from nativewind at monorepo root)
// to resolve to the same copy, preventing duplicate-React hook errors.
const mobileReact = path.resolve(projectRoot, "node_modules/react");
const mobileRN = path.resolve(projectRoot, "node_modules/react-native");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react" || moduleName.startsWith("react/")) {
    const suffix = moduleName === "react" ? "" : moduleName.slice("react".length);
    return context.resolveRequest(
      { ...context, originModulePath: path.resolve(projectRoot, "index.ts") },
      "react" + suffix,
      platform,
    );
  }
  if (moduleName === "react-native" || moduleName.startsWith("react-native/")) {
    const suffix = moduleName === "react-native" ? "" : moduleName.slice("react-native".length);
    return context.resolveRequest(
      { ...context, originModulePath: path.resolve(projectRoot, "index.ts") },
      "react-native" + suffix,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
