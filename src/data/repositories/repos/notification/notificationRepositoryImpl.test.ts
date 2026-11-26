import { Datasources } from "@data/datasource";

import notificationRepositoryImpl from "./notificationRepositoryImpl";

const methods = [
  "deleteDevice",
  "getDevices",
  "getNotifications",
  "getPreferences",
  "getSummaryPreview",
  "getUnreadCount",
  "getWebPushKey",
  "markAllRead",
  "markDeviceSeen",
  "markRead",
  "registerDevice",
  "sendTest",
  "updateDevice",
  "updatePreferences",
] as const;
const notificationDatasource = Object.fromEntries(
  methods.map((method) => [method, jest.fn().mockResolvedValue(method)]),
) as Record<(typeof methods)[number], jest.Mock>;
const repository = notificationRepositoryImpl({
  notificationDatasource,
} as unknown as Datasources);

beforeEach(() => jest.clearAllMocks());

it.each(methods)(
  "SHOULD pass %s straight to the datasource",
  async (method) => {
    const params = { id: "x" } as never;
    const call = repository[method] as (value?: never) => Promise<unknown>;

    expect(await call(params)).toBe(method);
    expect(notificationDatasource[method]).toHaveBeenCalledTimes(1);
  },
);
