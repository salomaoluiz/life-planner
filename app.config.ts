export default {
  expo: {
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: "./assets/images/adaptive-icon.png",
      },
      package: "com.jacobysoftware.lifeplanner",
    },
    experiments: {
      typedRoutes: true,
    },
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
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_PUBLIC_IOS_URL_SCHEME,
        },
      ],
    ],
    scheme: "myapp",
    slug: "life-planner",
    userInterfaceStyle: "automatic",
    version: "1.0.0",
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
      output: "single",
    },
  },
};
