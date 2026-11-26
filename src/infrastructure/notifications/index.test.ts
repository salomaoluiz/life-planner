import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Linking, Platform } from "react-native";

import { notificationsClient } from "./index";

jest.unmock("@infrastructure/notifications");

jest.mock("expo-notifications", () => ({
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  getExpoPushTokenAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));
jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: "project-1" } } } },
}));

beforeEach(() => jest.clearAllMocks());

describe("permission", () => {
  it.each([
    ["granted", "granted"],
    ["denied", "denied"],
    ["undetermined", "undetermined"],
  ])("SHOULD map the OS status %s", async (status, expected) => {
    jest
      .mocked(Notifications.getPermissionsAsync)
      .mockResolvedValue({ status } as never);
    jest
      .mocked(Notifications.requestPermissionsAsync)
      .mockResolvedValue({ status } as never);

    expect(await notificationsClient.getPermission()).toBe(expected);
    expect(await notificationsClient.requestPermission()).toBe(expected);
  });

  it("SHOULD create the Android channel before asking WHEN on Android", async () => {
    Platform.OS = "android";
    jest
      .mocked(Notifications.requestPermissionsAsync)
      .mockResolvedValue({ status: "granted" } as never);

    await notificationsClient.requestPermission();

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      "default",
      expect.anything(),
    );
    Platform.OS = "ios";
  });
});

describe("getRegistration", () => {
  it("SHOULD return the Expo token with the project id", async () => {
    jest
      .mocked(Notifications.getExpoPushTokenAsync)
      .mockResolvedValue({ data: "ExponentPushToken[abc]" } as never);

    expect(await notificationsClient.getRegistration()).toEqual({
      name: "iPhone",
      platform: "IOS",
      provider: "EXPO",
      token: "ExponentPushToken[abc]",
    });
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: "project-1",
    });
  });

  it("SHOULD return null WHEN no token can be created (Expo Go, simulator)", async () => {
    jest
      .mocked(Notifications.getExpoPushTokenAsync)
      .mockRejectedValue(new Error("no"));

    expect(await notificationsClient.getRegistration()).toBeNull();
  });
});

it("SHOULD forward taps and foreground pushes AND return the unsubscribe", () => {
  const remove = jest.fn();
  jest
    .mocked(Notifications.addNotificationResponseReceivedListener)
    .mockImplementation(((handler: (r: unknown) => void) => {
      handler({
        notification: {
          request: {
            content: { data: { notificationId: "n-1", route: "/r" } },
          },
        },
      });

      return { remove };
    }) as never);
  jest
    .mocked(Notifications.addNotificationReceivedListener)
    .mockReturnValue({ remove } as never);
  const onTap = jest.fn();
  const onReceive = jest.fn();

  notificationsClient.onTap(onTap)();
  notificationsClient.onReceive(onReceive)();

  expect(onTap).toHaveBeenCalledWith({ notificationId: "n-1", route: "/r" });
  expect(remove).toHaveBeenCalledTimes(2);
});

it("SHOULD keep the device id in the secure store", async () => {
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue("d-1");

  await notificationsClient.setDeviceId("d-1");

  expect(await notificationsClient.getDeviceId()).toBe("d-1");
  await notificationsClient.clearDeviceId();
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
    "notification_device_id",
    "d-1",
  );
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
    "notification_device_id",
  );
});

it("SHOULD open the app settings, report the locale and the time zone AND never ask for the home screen on native", async () => {
  const open = jest.spyOn(Linking, "openSettings").mockResolvedValue(undefined);

  await notificationsClient.openSystemSettings();

  expect(open).toHaveBeenCalledTimes(1);
  expect(["en-US", "pt-BR"]).toContain(notificationsClient.getLocale());
  expect(notificationsClient.getTimeZone()).toEqual(expect.any(String));
  expect(notificationsClient.needsHomeScreenInstall()).toBe(false);
});
