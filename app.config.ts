export default {
  expo: {
    name: "life-planner",
    slug: "life-planner",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
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
    experiments: {
      typedRoutes: true,
    },
  },
};
