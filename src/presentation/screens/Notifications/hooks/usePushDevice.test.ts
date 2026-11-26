import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import { notificationsClient } from "@infrastructure/notifications";
import { isWeb } from "@utils/platform";

import usePushDevice from "./usePushDevice";

jest.mock("@infrastructure/fetcher", () => ({
  invalidateFetcherData: jest.fn().mockResolvedValue(undefined),
  useQuery: jest.fn(),
}));
jest.mock("@utils/platform", () => ({ isWeb: jest.fn(() => false) }));
jest.mock("@application/useCases", () => ({
  useCases: {
    getNotificationDevicesUseCase: { execute: jest.fn() },
    getWebPushKeyUseCase: { execute: jest.fn() },
    registerNotificationDeviceUseCase: { execute: jest.fn() },
  },
}));

const client = jest.mocked(notificationsClient);

function setup(devices: unknown = [{ id: "d-1" }]) {
  jest.mocked(useQuery).mockReturnValue({ data: devices } as never);

  return renderHook(() => usePushDevice());
}

beforeEach(() => {
  jest.clearAllMocks();
  client.getDeviceId.mockResolvedValue(null);
  client.getPermission.mockResolvedValue("undetermined");
});

it("SHOULD read the permission AND the stored device id, and register only WHEN the server knows the device", async () => {
  client.getPermission.mockResolvedValue("denied");
  client.getDeviceId.mockResolvedValue("d-1");

  const { result } = setup();

  await waitFor(() => expect(result.current.deviceId).toBe("d-1"));
  expect(result.current.permission).toBe("denied");
  expect(result.current.isRegistered).toBe(true);
  expect(result.current.isLoaded).toBe(true);
});

it("SHOULD not count a stored id the server no longer has", async () => {
  client.getDeviceId.mockResolvedValue("gone");

  const { result } = setup();

  await waitFor(() => expect(result.current.deviceId).toBe("gone"));
  expect(result.current.isRegistered).toBe(false);
});

it("SHOULD stop WHEN the permission is not granted", async () => {
  client.requestPermission.mockResolvedValue("denied");
  const { result } = setup();

  await act(async () => {
    expect(await result.current.enable()).toBe("denied");
  });

  expect(client.getRegistration).not.toHaveBeenCalled();
  expect(result.current.permission).toBe("denied");
});

it("SHOULD register a native device with the token, locale and time zone AND keep its id", async () => {
  client.requestPermission.mockResolvedValue("granted");
  client.getRegistration.mockResolvedValue({
    name: "iPhone",
    platform: "IOS",
    provider: "EXPO",
    token: "ExponentPushToken[x]",
  });
  jest
    .mocked(useCases.registerNotificationDeviceUseCase.execute)
    .mockResolvedValue({ id: "d-9" });
  const { result } = setup([]);

  await act(async () => {
    expect(await result.current.enable()).toBe("granted");
  });

  expect(useCases.getWebPushKeyUseCase.execute).not.toHaveBeenCalled();
  expect(
    useCases.registerNotificationDeviceUseCase.execute,
  ).toHaveBeenCalledWith({
    locale: "pt-BR",
    name: "iPhone",
    platform: "IOS",
    provider: "EXPO",
    timeZone: "America/Sao_Paulo",
    token: "ExponentPushToken[x]",
  });
  expect(client.setDeviceId).toHaveBeenCalledWith("d-9");
  expect(result.current.deviceId).toBe("d-9");
  expect(result.current.isEnabling).toBe(false);
});

it("SHOULD ask the API for the VAPID key on the web", async () => {
  jest.mocked(isWeb).mockReturnValue(true);
  client.requestPermission.mockResolvedValue("granted");
  client.getRegistration.mockResolvedValue(null);
  jest.mocked(useCases.getWebPushKeyUseCase.execute).mockResolvedValue("BKey");
  const { result } = setup([]);

  await act(async () => {
    expect(await result.current.enable()).toBe("unsupported");
  });

  expect(client.getRegistration).toHaveBeenCalledWith("BKey");
  jest.mocked(isWeb).mockReturnValue(false);
});

it("SHOULD forward the settings shortcut AND the home screen hint", async () => {
  client.needsHomeScreenInstall.mockReturnValue(true);
  const { result } = setup();

  await result.current.openSystemSettings();

  expect(client.openSystemSettings).toHaveBeenCalledTimes(1);
  expect(result.current.needsHomeScreenInstall).toBe(true);
  client.needsHomeScreenInstall.mockReturnValue(false);
});

it("SHOULD show no devices WHEN the API fails", async () => {
  setup([]);
  jest
    .mocked(useCases.getNotificationDevicesUseCase.execute)
    .mockRejectedValue(new Error("500"));

  expect(await jest.mocked(useQuery).mock.calls.at(-1)?.[0].fetch()).toEqual(
    [],
  );
});
