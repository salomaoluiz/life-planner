import {
  NotificationDeviceEntity,
  NotificationFilters,
  NotificationPageEntity,
  NotificationPreferencesEntity,
  NotificationPreferencesPatch,
  NotificationSummaryPreview,
  RegisterNotificationDeviceInput,
} from "@domain/entities/notification/NotificationEntity";

export type NotificationRepository = {
  deleteDevice(params: { id: string }): Promise<void>;
  getDevices(): Promise<NotificationDeviceEntity[]>;
  getNotifications(
    params: NotificationFilters,
  ): Promise<NotificationPageEntity>;
  getPreferences(): Promise<NotificationPreferencesEntity>;
  getSummaryPreview(): Promise<NotificationSummaryPreview>;
  getUnreadCount(): Promise<number>;
  getWebPushKey(): Promise<string>;
  markAllRead(): Promise<void>;
  markDeviceSeen(params: {
    id: string;
    locale: string;
    timeZone: string;
  }): Promise<void>;
  markRead(params: { id: string }): Promise<void>;
  registerDevice(
    params: RegisterNotificationDeviceInput,
  ): Promise<{ id: string }>;
  sendTest(params: { deviceId?: string }): Promise<void>;
  updateDevice(params: {
    enabled?: boolean;
    id: string;
    name?: string;
  }): Promise<NotificationDeviceEntity>;
  updatePreferences(
    params: NotificationPreferencesPatch,
  ): Promise<NotificationPreferencesEntity>;
};
