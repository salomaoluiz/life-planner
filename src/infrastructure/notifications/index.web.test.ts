import { asyncStorage } from "@infrastructure/storage";

import { notificationsClient } from "./index.web";

jest.unmock("@infrastructure/notifications");
jest.mock("@infrastructure/storage", () => ({
  asyncStorage: {
    deleteItem: jest.fn(),
    getString: jest.fn(),
    setString: jest.fn(),
  },
}));

type Globals = Record<string, unknown>;
const listeners: ((event: unknown) => void)[] = [];
function dispatch(event: unknown) {
  listeners.forEach((listener) => listener(event));
}
const subscription = {
  endpoint: "https://push.example.com/x",
  getKey: (name: string) =>
    new Uint8Array(name === "auth" ? [1, 2] : [3, 4]).buffer,
};
const serviceWorker = {
  addEventListener: jest.fn(
    (_type: string, handler: (event: unknown) => void) => {
      listeners.push(handler);
    },
  ),
  ready: Promise.resolve({
    pushManager: { subscribe: jest.fn().mockResolvedValue(subscription) },
  }),
  register: jest.fn().mockResolvedValue({}),
  removeEventListener: jest.fn(),
};

function define(name: string, value: unknown) {
  Object.defineProperty(global, name, {
    configurable: true,
    value,
    writable: true,
  });
}

function setBrowser(
  options: {
    agent?: string;
    language?: string;
    permission?: string;
    push?: boolean;
    standalone?: boolean;
  } = {},
) {
  const supported = options.push !== false;

  define("navigator", {
    language: options.language ?? "pt-BR",
    ...(supported ? { serviceWorker } : {}),
    standalone: options.standalone,
    userAgent:
      options.agent ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/120",
  });
  define(
    "window",
    supported
      ? {
          matchMedia: () => ({ matches: false }),
          Notification: {},
          PushManager: {},
        }
      : {},
  );
  define(
    "Notification",
    supported
      ? {
          permission: options.permission ?? "default",
          requestPermission: jest.fn().mockResolvedValue("granted"),
        }
      : undefined,
  );
  if (!supported) {
    delete (global as unknown as Globals).Notification;
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  listeners.length = 0;
  setBrowser();
});

it("SHOULD map the browser permission AND report unsupported without the Push API", async () => {
  expect(await notificationsClient.getPermission()).toBe("undetermined");
  setBrowser({ permission: "denied" });
  expect(await notificationsClient.getPermission()).toBe("denied");
  setBrowser({ permission: "granted" });
  expect(await notificationsClient.getPermission()).toBe("granted");
  setBrowser({ push: false });
  expect(await notificationsClient.getPermission()).toBe("unsupported");
  expect(await notificationsClient.requestPermission()).toBe("unsupported");
});

it("SHOULD ask the browser for the permission", async () => {
  expect(await notificationsClient.requestPermission()).toBe("granted");
});

it("SHOULD subscribe with the VAPID key AND return the endpoint with the keys", async () => {
  const registration =
    await notificationsClient.getRegistration("BPublicKeyAAAA");

  expect(serviceWorker.register).toHaveBeenCalledWith("/sw.js");
  expect(registration).toEqual({
    name: "Chrome no Mac",
    platform: "WEB",
    provider: "WEB_PUSH",
    token: "https://push.example.com/x",
    webKeys: { auth: "AQI", p256dh: "AwQ" },
  });
});

it("SHOULD return null WITHOUT the VAPID key, WITHOUT support or WHEN the subscription fails", async () => {
  expect(await notificationsClient.getRegistration()).toBeNull();
  setBrowser({ push: false });
  expect(await notificationsClient.getRegistration("BKey")).toBeNull();
  setBrowser();
  serviceWorker.register.mockRejectedValueOnce(new Error("blocked"));
  expect(await notificationsClient.getRegistration("BKey")).toBeNull();
});

it.each([
  ["Mozilla/5.0 (Windows NT 10) Edg/120 Chrome/120", "Edge no Windows"],
  ["Mozilla/5.0 (X11; Linux) Firefox/120", "Firefox no Linux"],
  ["Mozilla/5.0 (Linux; Android 14) Chrome/120", "Chrome no Android"],
  ["Mozilla/5.0 (iPhone; CPU iPhone OS 17) Safari/605", "Safari no iPhone"],
])("SHOULD name the device %s", async (agent, name) => {
  setBrowser({ agent });

  expect((await notificationsClient.getRegistration("BKey"))?.name).toBe(name);
});

it("SHOULD ask for the Home Screen only on iOS Safari without the Push API", () => {
  setBrowser({
    agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17) Safari/605",
    push: false,
  });
  expect(notificationsClient.needsHomeScreenInstall()).toBe(true);
  setBrowser({
    agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17) Safari/605",
    push: false,
    standalone: true,
  });
  expect(notificationsClient.needsHomeScreenInstall()).toBe(false);
  setBrowser();
  expect(notificationsClient.needsHomeScreenInstall()).toBe(false);
});

it("SHOULD forward service worker messages for taps AND foreground pushes, AND stop listening", () => {
  const onTap = jest.fn();
  const onReceive = jest.fn();

  const offTap = notificationsClient.onTap(onTap);
  notificationsClient.onReceive(onReceive);
  dispatch({
    data: { data: { notificationId: "n-1" }, type: "notification-click" },
  });
  dispatch({ data: { type: "push-received" } });
  dispatch({ data: { type: "other" } });
  offTap();

  expect(onTap).toHaveBeenCalledWith({ notificationId: "n-1" });
  expect(onReceive).toHaveBeenCalledTimes(1);
  expect(serviceWorker.removeEventListener).toHaveBeenCalledTimes(1);
});

it("SHOULD do nothing WITHOUT a service worker", () => {
  setBrowser({ push: false });

  expect(notificationsClient.onTap(jest.fn())).toEqual(expect.any(Function));
  expect(notificationsClient.onReceive(jest.fn())).toEqual(
    expect.any(Function),
  );
});

it("SHOULD keep the device id in the local storage AND read the language", async () => {
  jest.mocked(asyncStorage.getString).mockReturnValue("d-1");

  await notificationsClient.setDeviceId("d-1");
  await notificationsClient.clearDeviceId();

  expect(await notificationsClient.getDeviceId()).toBe("d-1");
  expect(asyncStorage.setString).toHaveBeenCalledWith(
    "notification_device_id",
    "d-1",
  );
  expect(asyncStorage.deleteItem).toHaveBeenCalledWith(
    "notification_device_id",
  );
  expect(notificationsClient.getLocale()).toBe("pt-BR");
  setBrowser({ language: "en-GB" });
  expect(notificationsClient.getLocale()).toBe("en-US");
  expect(notificationsClient.getTimeZone()).toEqual(expect.any(String));
  await expect(
    notificationsClient.openSystemSettings(),
  ).resolves.toBeUndefined();
});
