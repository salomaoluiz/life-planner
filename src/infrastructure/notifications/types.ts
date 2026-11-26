import {
  DevicePlatform,
  NotificationLocale,
  PushProvider,
} from "@domain/entities/notification/NotificationEntity";

// Spec 124 section 8: the only place that touches `expo-notifications`, the service worker and the Push API
// (golden rule 2). The permission is never asked for here on its own: the card in the app calls `requestPermission`.
export interface NotificationsClient {
  clearDeviceId(): Promise<void>;
  getDeviceId(): Promise<null | string>;
  getLocale(): NotificationLocale;
  getPermission(): Promise<PushPermission>;
  // A token or subscription for this device; `null` when it cannot be created. `vapidKey` is only read on the web.
  getRegistration(vapidKey?: string): Promise<null | PushRegistration>;
  getTimeZone(): string;
  // iOS Safari outside the Home Screen app: the web push is not offered (FR 34).
  needsHomeScreenInstall(): boolean;
  onReceive(handler: () => void): () => void;
  onTap(handler: (data: PushTapData) => void): () => void;
  openSystemSettings(): Promise<void>;
  requestPermission(): Promise<PushPermission>;
  setDeviceId(id: string): Promise<void>;
}

// "unsupported": this platform cannot receive push (an old browser, iOS Safari outside the Home Screen app, a simulator).
export type PushPermission =
  | "denied"
  | "granted"
  | "undetermined"
  | "unsupported";

export interface PushRegistration {
  name: string;
  platform: DevicePlatform;
  provider: PushProvider;
  token: string;
  webKeys?: { auth: string; p256dh: string };
}

export interface PushTapData {
  notificationId?: string;
  route?: string;
}
