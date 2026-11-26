import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Linking, Platform } from "react-native";

import { NotificationLocale } from "@domain/entities/notification/NotificationEntity";

import {
  NotificationsClient,
  PushPermission,
  PushRegistration,
  PushTapData,
} from "./types";

const DEVICE_ID_KEY = "notification_device_id";
const CHANNEL = "default";

// Foreground pushes only refresh the unread count: no banner, no sound (FR section 8).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: false,
  }),
});

function resolveLocale(): NotificationLocale {
  const tag = Intl.DateTimeFormat().resolvedOptions().locale;

  return tag.toLowerCase().startsWith("en") ? "en-US" : "pt-BR";
}

function toPermission(status: string): PushPermission {
  if (status === "granted") {
    return "granted";
  }

  return status === "denied" ? "denied" : "undetermined";
}

const notificationsClient: NotificationsClient = {
  async clearDeviceId() {
    await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
  },
  async getDeviceId() {
    return SecureStore.getItemAsync(DEVICE_ID_KEY);
  },
  getLocale: resolveLocale,
  async getPermission() {
    const { status } = await Notifications.getPermissionsAsync();

    return toPermission(status);
  },
  async getRegistration(): Promise<null | PushRegistration> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId as
        | string
        | undefined;
      const { data } = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );

      return {
        name: Platform.OS === "ios" ? "iPhone" : "Android",
        platform: Platform.OS === "ios" ? "IOS" : "ANDROID",
        provider: "EXPO",
        token: data,
      };
    } catch {
      // Expo Go and simulators cannot get a push token: the center keeps working.
      return null;
    }
  },
  getTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },
  needsHomeScreenInstall: () => false,
  onReceive(handler) {
    const subscription = Notifications.addNotificationReceivedListener(handler);

    return () => subscription.remove();
  },
  onTap(handler) {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) =>
        handler(response.notification.request.content.data as PushTapData),
    );

    return () => subscription.remove();
  },
  async openSystemSettings() {
    await Linking.openSettings();
  },
  async requestPermission() {
    if (Platform.OS === "android") {
      // Android 13 asks the permission only once a channel exists.
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        importance: Notifications.AndroidImportance.DEFAULT,
        name: CHANNEL,
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();

    return toPermission(status);
  },
  async setDeviceId(id) {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  },
};

export { notificationsClient };
export type {
  NotificationsClient,
  PushPermission,
  PushRegistration,
  PushTapData,
} from "./types";
