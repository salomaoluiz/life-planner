import { Platform } from "react-native";
import {
  isAndroid,
  isIOS,
  isSupportedPlatform,
  isWeb,
  SupportedPlatform,
} from "@utils/platform";

it("SHOULD return true WHEN platform is web", () => {
  Platform.OS = "web";

  const result = isWeb();

  expect(result).toBeTruthy();
});

it("SHOULD return true WHEN platform is android", () => {
  Platform.OS = "android";

  const result = isAndroid();

  expect(result).toBeTruthy();
});

it("SHOULD return true WHEN platform is ios", () => {
  Platform.OS = "ios";

  const result = isIOS();

  expect(result).toBeTruthy();
});

it.each([
  SupportedPlatform.Android,
  SupportedPlatform.IOS,
  SupportedPlatform.Web,
])(`SHOULD return true WHEN platform is %s`, (platform) => {
  Platform.OS = platform;

  const result = isSupportedPlatform();

  expect(result).toBeTruthy();
});

it("SHOULD throw error WHEN platform is unsupported", () => {
  Platform.OS = "unsupported" as never;

  expect(() => isSupportedPlatform()).toThrow("Unsupported platform");
});
