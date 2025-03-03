import { Platform } from "react-native";

enum SupportedPlatform {
  Web = "web",
  Android = "android",
  IOS = "ios",
}

function getPlatform() {
  switch (Platform.OS) {
    case "web":
      return SupportedPlatform.Web;
    case "android":
      return SupportedPlatform.Android;
    case "ios":
      return SupportedPlatform.IOS;
  }

  throw new Error("Unsupported platform");
}

function isWeb() {
  return getPlatform() === SupportedPlatform.Web;
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

export {
  getPlatform,
  SupportedPlatform,
  isSupportedPlatform,
  isWeb,
  isAndroid,
  isIOS,
};
