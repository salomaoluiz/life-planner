import pkg from "./package.json";
import { versionCode } from "./scripts/versionCode";

// Spec 117 FR 20: the QR link `https://<web host>/stock/locations/<id>` opens the app when it is installed (iOS
// associated domains, Android app links) and the web app otherwise. The host is the web deploy's own.
function webHost(): string | undefined {
  const url = process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL;

  try {
    return url ? new URL(url).host : undefined;
  } catch {
    return undefined;
  }
}

const host = webHost();

export default {
  expo: {
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: "./assets/images/adaptive-icon.png",
      },
      intentFilters: host
        ? [
            {
              action: "VIEW",
              autoVerify: true,
              category: ["BROWSABLE", "DEFAULT"],
              data: [{ host, pathPrefix: "/stock/locations", scheme: "https" }],
            },
          ]
        : undefined,
      package: "com.jacobysoftware.lifeplanner",
      versionCode: versionCode(pkg.version),
    },
    experiments: {
      typedRoutes: true,
    },
    extra: { builtAt: process.env.BUILT_AT ?? new Date().toISOString() },
    icon: "./assets/images/icon.png",
    ios: {
      associatedDomains: host ? [`applinks:${host}`] : undefined,
      bundleIdentifier: "com.jacobysoftware.lifeplanner",
      supportsTablet: true,
    },
    name: "life-planner",
    newArchEnabled: true,
    orientation: "portrait",
    plugins: [
      ["expo-router", { asyncRoutes: { default: false, web: true } }],
      "./plugins/withReleaseSigning",
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow $(PRODUCT_NAME) to use the camera to read barcodes.",
          recordAudioAndroid: false,
        },
      ],
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
