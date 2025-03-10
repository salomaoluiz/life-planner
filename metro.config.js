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

module.exports = {
  ...defaultConfig,
  ...sentryConfig,
  transformer: {
    ...(defaultConfig.transformer || {}),
    ...(sentryConfig.transformer || {}),
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    ...(defaultConfig.resolver || {}),
    ...(sentryConfig.resolver || {}),
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
  },
};
