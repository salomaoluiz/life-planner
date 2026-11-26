import { api } from "@infrastructure/api";

import notificationDatasource from "./datasource";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

const datasource = notificationDatasource();

beforeEach(() => jest.clearAllMocks());

it("SHOULD read the page with the filters in the query AND map it", async () => {
  jest.mocked(api.get).mockResolvedValue({
    items: [{ id: "n-1", kind: "URGENT" }],
    nextCursor: "c2",
  });

  const page = await datasource.getNotifications({
    cursor: "c1",
    module: "STOCK",
    unread: true,
  });

  expect(api.get).toHaveBeenCalledWith(
    "/v1/notifications?cursor=c1&module=STOCK&unread=true",
  );
  expect(page.nextCursor).toBe("c2");
  expect(page.items[0]).toEqual(
    expect.objectContaining({ id: "n-1", kind: "URGENT" }),
  );
});

it("SHOULD send no query WHEN there are no filters AND keep unread=false", async () => {
  jest.mocked(api.get).mockResolvedValue({});

  await datasource.getNotifications({});
  await datasource.getNotifications({ unread: false });

  expect(api.get).toHaveBeenNthCalledWith(1, "/v1/notifications");
  expect(api.get).toHaveBeenNthCalledWith(2, "/v1/notifications?unread=false");
});

it("SHOULD read the count, the preview AND the web push key", async () => {
  jest
    .mocked(api.get)
    .mockResolvedValueOnce({ count: 3 })
    .mockResolvedValueOnce({ count: 2, hasItems: true })
    .mockResolvedValueOnce({ publicKey: "BKey" })
    .mockResolvedValueOnce({});

  expect(await datasource.getUnreadCount()).toBe(3);
  expect(await datasource.getSummaryPreview()).toEqual({
    count: 2,
    hasItems: true,
  });
  expect(await datasource.getWebPushKey()).toBe("BKey");
  expect(await datasource.getUnreadCount()).toBe(0);
});

it("SHOULD read and update the preferences", async () => {
  jest.mocked(api.get).mockResolvedValue({ summaryTime: "08:00" });
  jest.mocked(api.patch).mockResolvedValue({ summaryTime: "09:00" });

  expect((await datasource.getPreferences()).summaryTime).toBe("08:00");
  expect(
    (await datasource.updatePreferences({ summaryTime: "09:00" })).summaryTime,
  ).toBe("09:00");
  expect(api.patch).toHaveBeenCalledWith("/v1/notifications/preferences", {
    summaryTime: "09:00",
  });
});

it("SHOULD list devices, register one, update, mark seen AND delete", async () => {
  jest
    .mocked(api.get)
    .mockResolvedValueOnce({ items: [{ id: "d-1", name: "iPhone" }] });
  jest.mocked(api.post).mockResolvedValue({ id: "d-2" });
  jest.mocked(api.patch).mockResolvedValue({ enabled: false, id: "d-2" });

  expect((await datasource.getDevices())[0].name).toBe("iPhone");
  expect(
    await datasource.registerDevice({
      locale: "pt-BR",
      name: "Chrome",
      platform: "WEB",
      provider: "WEB_PUSH",
      timeZone: "UTC",
      token: "https://push.example.com/x",
      webKeys: { auth: "a", p256dh: "p" },
    }),
  ).toEqual({ id: "d-2" });
  expect(
    (await datasource.updateDevice({ enabled: false, id: "d-2" })).enabled,
  ).toBe(false);
  await datasource.markDeviceSeen({
    id: "d-2",
    locale: "pt-BR",
    timeZone: "UTC",
  });
  await datasource.deleteDevice({ id: "d-2" });

  expect(api.patch).toHaveBeenCalledWith("/v1/notifications/devices/d-2", {
    enabled: false,
  });
  expect(api.patch).toHaveBeenCalledWith("/v1/notifications/devices/d-2/seen", {
    locale: "pt-BR",
    timeZone: "UTC",
  });
  expect(api.delete).toHaveBeenCalledWith("/v1/notifications/devices/d-2");
});

it("SHOULD mark notices read, all of them AND send the test push", async () => {
  await datasource.markRead({ id: "n-1" });
  await datasource.markAllRead();
  await datasource.sendTest({});
  await datasource.sendTest({ deviceId: "d-1" });

  expect(api.post).toHaveBeenCalledWith("/v1/notifications/n-1/read", {});
  expect(api.post).toHaveBeenCalledWith("/v1/notifications/read-all", {});
  expect(api.post).toHaveBeenCalledWith("/v1/notifications/test", {});
  expect(api.post).toHaveBeenCalledWith("/v1/notifications/test", {
    deviceId: "d-1",
  });
});
