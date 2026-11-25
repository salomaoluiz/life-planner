import { renderHook } from "@testing-library/react-native";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { useScannerPermission, vibrateOnScan } from "./index";

jest.mock("expo-camera", () => ({
  CameraView: "CameraView",
  useCameraPermissions: jest.fn(),
}));
jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: "success" },
}));

const permissions = jest.mocked(useCameraPermissions);
const request = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = "ios";
});

describe("useScannerPermission", () => {
  it.each([
    ["not read yet", null, "loading"],
    ["granted", { canAskAgain: true, granted: true }, "granted"],
    ["denied for good", { canAskAgain: false, granted: false }, "denied"],
    ["not asked yet", { canAskAgain: true, granted: false }, "loading"],
  ])("SHOULD be %s", (_label, permission, expected) => {
    permissions.mockReturnValue([permission as never, request, jest.fn()]);

    const { result } = renderHook(() => useScannerPermission());

    expect(result.current.status).toBe(expected);
  });

  it("SHOULD ask through expo-camera", async () => {
    permissions.mockReturnValue([null, request, jest.fn()]);

    const { result } = renderHook(() => useScannerPermission());

    await result.current.request();

    expect(request).toHaveBeenCalledTimes(1);
  });
});

describe("vibrateOnScan", () => {
  it("SHOULD vibrate once on native", () => {
    vibrateOnScan();

    expect(Haptics.notificationAsync).toHaveBeenCalledWith("success");
  });

  it("SHOULD do nothing on web", () => {
    Platform.OS = "web";

    vibrateOnScan();

    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
