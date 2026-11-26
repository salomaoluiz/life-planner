import { Datasources } from "@data/datasource";
import { NotificationRepository } from "@domain/repositories/notification";

// Never cached: the bell and the center must show what the server has now (money is not cached with max-age).
function notificationRepositoryImpl(
  datasources: Datasources,
): NotificationRepository {
  const datasource = datasources.notificationDatasource;

  return {
    deleteDevice: async (params) => datasource.deleteDevice(params),
    getDevices: async () => datasource.getDevices(),
    getNotifications: async (params) => datasource.getNotifications(params),
    getPreferences: async () => datasource.getPreferences(),
    getSummaryPreview: async () => datasource.getSummaryPreview(),
    getUnreadCount: async () => datasource.getUnreadCount(),
    getWebPushKey: async () => datasource.getWebPushKey(),
    markAllRead: async () => datasource.markAllRead(),
    markDeviceSeen: async (params) => datasource.markDeviceSeen(params),
    markRead: async (params) => datasource.markRead(params),
    registerDevice: async (params) => datasource.registerDevice(params),
    sendTest: async (params) => datasource.sendTest(params),
    updateDevice: async (params) => datasource.updateDevice(params),
    updatePreferences: async (params) => datasource.updatePreferences(params),
  };
}

export default notificationRepositoryImpl;
