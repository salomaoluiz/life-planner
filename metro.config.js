/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const sentryConfig = getSentryExpoConfig(__dirname);

const path = require("path");

const SENTRY_WEB_SHIMS = new Set([
  "@sentry-internal/feedback",
  "@sentry-internal/replay",
  "@sentry-internal/replay-canvas",
]);
const sentryWebShim = path.resolve(__dirname, "scripts/metro/sentryWebShim.js");
const previousResolveRequest =
  sentryConfig.resolver?.resolveRequest ??
  defaultConfig.resolver?.resolveRequest;

function resolveRequest(context, moduleName, platform) {
  if (platform === "web" && SENTRY_WEB_SHIMS.has(moduleName)) {
    return { filePath: sentryWebShim, type: "sourceFile" };
  }
  if (previousResolveRequest) {
    return previousResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
}

module.exports = {
  ...defaultConfig,
  ...sentryConfig,
  resolver: {
    ...(defaultConfig.resolver || {}),
    ...(sentryConfig.resolver || {}),
    resolveRequest,
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
  },
  transformer: {
    ...(defaultConfig.transformer || {}),
    ...(sentryConfig.transformer || {}),
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
};
