import { Platform } from "react-native";

enum SupportedPlatform {
  Android = "android",
  IOS = "ios",
  Web = "web",
}

function getPlatform() {
  switch (Platform.OS) {
    case "android":
      return SupportedPlatform.Android;
    case "ios":
      return SupportedPlatform.IOS;
    case "web":
      return SupportedPlatform.Web;
  }

  throw new Error("Unsupported platform");
}

function isAndroid() {
  return getPlatform() === SupportedPlatform.Android;
}

function isIOS() {
  return getPlatform() === SupportedPlatform.IOS;
}

function isSupportedPlatform() {
  const platform = getPlatform();

  return (
    platform === SupportedPlatform.Android ||
    platform === SupportedPlatform.IOS ||
    platform === SupportedPlatform.Web
  );
}

function isWeb() {
  return getPlatform() === SupportedPlatform.Web;
}

export {
  getPlatform,
  isAndroid,
  isIOS,
  isSupportedPlatform,
  isWeb,
  SupportedPlatform,
};
