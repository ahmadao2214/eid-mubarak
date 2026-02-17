// Root babel config for monorepo jest compatibility
const path = require("path");

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      path.resolve(
        __dirname,
        "apps/mobile/node_modules/react-native-reanimated/plugin"
      ),
    ],
  };
};
