import { Platform, Share } from "react-native";

import { isShareAvailable, shareText } from "./";

const originalOS = Platform.OS;
const originalNavigator = global.navigator;

afterEach(() => {
  Platform.OS = originalOS;
  Object.defineProperty(global, "navigator", {
    configurable: true,
    value: originalNavigator,
  });
  jest.restoreAllMocks();
});

function setNavigator(value: unknown) {
  Object.defineProperty(global, "navigator", { configurable: true, value });
}

it("SHOULD be available on native", () => {
  Platform.OS = "ios";

  expect(isShareAvailable()).toBe(true);
});

it("SHOULD be available on web only WHEN navigator.share exists", () => {
  Platform.OS = "web";
  setNavigator({ share: jest.fn() });
  expect(isShareAvailable()).toBe(true);

  setNavigator({});
  expect(isShareAvailable()).toBe(false);
});

it("SHOULD open the OS share sheet with the text", async () => {
  const spy = jest
    .spyOn(Share, "share")
    .mockResolvedValue({ action: "sharedAction" });

  await shareText("hello");

  expect(spy).toHaveBeenCalledWith({ message: "hello" });
});

it("SHOULD ignore a cancelled share (web AbortError)", async () => {
  const abort = Object.assign(new Error("cancelled"), { name: "AbortError" });
  jest.spyOn(Share, "share").mockRejectedValue(abort);

  await expect(shareText("hello")).resolves.toBeUndefined();
});

it("SHOULD re-throw any other share error", async () => {
  jest.spyOn(Share, "share").mockRejectedValue(new Error("boom"));

  await expect(shareText("hello")).rejects.toThrow("boom");
});
