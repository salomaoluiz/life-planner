import pkg from "./package.json";
import { versionCode } from "./scripts/versionCode";

export default {
  expo: {
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: "./assets/images/adaptive-icon.png",
      },
      package: "com.jacobysoftware.lifeplanner",
      versionCode: versionCode(pkg.version),
    },
    experiments: {
      typedRoutes: true,
    },
    extra: { builtAt: process.env.BUILT_AT ?? new Date().toISOString() },
    icon: "./assets/images/icon.png",
    ios: {
      bundleIdentifier: "com.jacobysoftware.lifeplanner",
      supportsTablet: true,
    },
    name: "life-planner",
    newArchEnabled: true,
    orientation: "portrait",
    plugins: [
      "expo-router",
      "./plugins/withReleaseSigning",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ffffff",
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          note: process.env.EXPO_PUBLIC_SENTRY_AUTH_TOKEN,
          organization: process.env.EXPO_PUBLIC_SENTRY_ORGANIZATION,
          project: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
          url: process.env.EXPO_PUBLIC_SENTRY_URL,
        },
      ],
    ],
    scheme: "myapp",
    slug: "life-planner",
    userInterfaceStyle: "automatic",
    version: pkg.version,
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
      output: "single",
    },
  },
};
