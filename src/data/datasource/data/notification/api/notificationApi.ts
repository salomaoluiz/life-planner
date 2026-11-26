import NotificationModels from "@data/models/notification/NotificationModels";
import { NotificationDatasource } from "@data/repositories/repos/notification/notificationDatasource";
import { api } from "@infrastructure/api";

type Json = Record<string, unknown>;

const BASE = "/v1/notifications";

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams(
    Object.entries(params).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  ).toString();

  return search ? `?${search}` : "";
}

// Spec 124 section 7. Tokens and keys only travel in the register call and are never logged or returned.
export const notificationApi: NotificationDatasource = {
  async deleteDevice({ id }) {
    await api.delete(`${BASE}/devices/${id}`);
  },
  async getDevices() {
    const data = await api.get<{ items?: Json[] }>(`${BASE}/devices`);

    return (data.items ?? []).map((device) =>
      NotificationModels.deviceFromJSON(device),
    );
  },
  async getNotifications({ cursor, module, unread }) {
    const data = await api.get<Json>(
      `${BASE}${query({
        cursor,
        module,
        unread: unread === undefined ? undefined : String(unread),
      })}`,
    );

    return NotificationModels.pageFromJSON(data);
  },
  async getPreferences() {
    return NotificationModels.preferencesFromJSON(
      await api.get<Json>(`${BASE}/preferences`),
    );
  },
  async getSummaryPreview() {
    const data = await api.get<{ count?: number; hasItems?: boolean }>(
      `${BASE}/summary-preview`,
    );

    return { count: Number(data.count ?? 0), hasItems: data.hasItems === true };
  },
  async getUnreadCount() {
    const data = await api.get<{ count?: number }>(`${BASE}/unread-count`);

    return Number(data.count ?? 0);
  },
  async getWebPushKey() {
    const data = await api.get<{ publicKey: string }>(`${BASE}/web-push-key`);

    return data.publicKey;
  },
  async markAllRead() {
    await api.post(`${BASE}/read-all`, {});
  },
  async markDeviceSeen({ id, locale, timeZone }) {
    await api.patch(`${BASE}/devices/${id}/seen`, { locale, timeZone });
  },
  async markRead({ id }) {
    await api.post(`${BASE}/${id}/read`, {});
  },
  async registerDevice(params) {
    const data = await api.post<{ id: string }>(`${BASE}/devices`, params);

    return { id: data.id };
  },
  async sendTest({ deviceId }) {
    await api.post(`${BASE}/test`, deviceId ? { deviceId } : {});
  },
  async updateDevice({ id, ...patch }) {
    return NotificationModels.deviceFromJSON(
      await api.patch<Json>(`${BASE}/devices/${id}`, patch),
    );
  },
  async updatePreferences(patch) {
    return NotificationModels.preferencesFromJSON(
      await api.patch<Json>(`${BASE}/preferences`, patch),
    );
  },
};
