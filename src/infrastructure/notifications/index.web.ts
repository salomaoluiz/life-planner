import { NotificationLocale } from "@domain/entities/notification/NotificationEntity";
import { asyncStorage } from "@infrastructure/storage";

import {
  NotificationsClient,
  PushPermission,
  PushRegistration,
  PushTapData,
} from "./types";

const DEVICE_ID_KEY = "notification_device_id";
const WORKER_PATH = "/sw.js";

function applicationKey(base64: string): ArrayBuffer {
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(padded);

  return Uint8Array.from(raw, (char) => char.charCodeAt(0))
    .buffer as ArrayBuffer;
}

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
];
const SYSTEMS: [RegExp, string][] = [
  [/iPhone|iPad|iPod/, "iPhone"],
  [/Android/, "Android"],
  [/Mac OS X/, "Mac"],
  [/Windows/, "Windows"],
];

function deviceName(): string {
  const agent = navigator.userAgent;

  return `${firstMatch(BROWSERS, agent, "Safari")} no ${firstMatch(SYSTEMS, agent, "Linux")}`;
}

function encode(buffer: ArrayBuffer | null): string {
  return buffer
    ? btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")
    : "";
}

function firstMatch(
  table: [RegExp, string][],
  agent: string,
  fallback: string,
) {
  return table.find(([pattern]) => pattern.test(agent))?.[1] ?? fallback;
}

function isIosBrowser(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// FR 34: the Push API exists in iOS Safari only for the app added to the Home Screen (iOS 16.4+).
function isSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function toPermission(value: NotificationPermission): PushPermission {
  if (value === "granted") {
    return "granted";
  }

  return value === "denied" ? "denied" : "undetermined";
}

const notificationsClient: NotificationsClient = {
  async clearDeviceId() {
    asyncStorage.deleteItem(DEVICE_ID_KEY);
  },
  async getDeviceId() {
    return asyncStorage.getString(DEVICE_ID_KEY);
  },
  getLocale(): NotificationLocale {
    return navigator.language.toLowerCase().startsWith("en")
      ? "en-US"
      : "pt-BR";
  },
  async getPermission() {
    return isSupported()
      ? toPermission(Notification.permission)
      : "unsupported";
  },
  async getRegistration(vapidKey): Promise<null | PushRegistration> {
    if (!isSupported() || !vapidKey) {
      return null;
    }

    try {
      const worker = await navigator.serviceWorker.register(WORKER_PATH);
      const ready = await navigator.serviceWorker.ready;
      const subscription = await (ready ?? worker).pushManager.subscribe({
        applicationServerKey: applicationKey(vapidKey),
        userVisibleOnly: true,
      });

      return {
        name: deviceName(),
        platform: "WEB",
        provider: "WEB_PUSH",
        token: subscription.endpoint,
        webKeys: {
          auth: encode(subscription.getKey("auth")),
          p256dh: encode(subscription.getKey("p256dh")),
        },
      };
    } catch {
      return null;
    }
  },
  getTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },
  needsHomeScreenInstall: () =>
    isIosBrowser() && !isStandalone() && !isSupported(),
  onReceive(handler) {
    if (!("serviceWorker" in navigator)) {
      return () => undefined;
    }

    function listener(event: MessageEvent) {
      if (event.data?.type === "push-received") {
        handler();
      }
    }

    navigator.serviceWorker.addEventListener("message", listener);

    return () =>
      navigator.serviceWorker.removeEventListener("message", listener);
  },
  onTap(handler) {
    if (!("serviceWorker" in navigator)) {
      return () => undefined;
    }

    function listener(event: MessageEvent) {
      if (event.data?.type === "notification-click") {
        handler(event.data.data as PushTapData);
      }
    }

    navigator.serviceWorker.addEventListener("message", listener);

    return () =>
      navigator.serviceWorker.removeEventListener("message", listener);
  },
  async openSystemSettings() {
    // A browser cannot open its own settings: the card explains how to allow notifications.
  },
  async requestPermission() {
    if (!isSupported()) {
      return "unsupported";
    }

    return toPermission(await Notification.requestPermission());
  },
  async setDeviceId(id) {
    asyncStorage.setString(DEVICE_ID_KEY, id);
  },
};

export { notificationsClient };
export type {
  NotificationsClient,
  PushPermission,
  PushRegistration,
  PushTapData,
} from "./types";
