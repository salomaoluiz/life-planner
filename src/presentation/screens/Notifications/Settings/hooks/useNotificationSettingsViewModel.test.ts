import { renderHook } from "@testing-library/react-native";

import { ApiBusinessError } from "@domain/entities/errors";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import usePushDevice from "@screens/Notifications/hooks/usePushDevice";

import useNotificationSettingsViewModel from "./useNotificationSettingsViewModel";

jest.mock("@infrastructure/fetcher", () => ({
  invalidateFetcherData: jest.fn().mockResolvedValue(undefined),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));
jest.mock("@screens/Notifications/hooks/usePushDevice");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteNotificationDeviceUseCase: {
      execute: jest.fn(),
      uniqueName: "delete",
    },
    getNotificationPreferencesUseCase: {
      execute: jest.fn(),
      uniqueName: "prefs",
    },
    sendTestNotificationUseCase: { execute: jest.fn(), uniqueName: "test" },
    updateNotificationDeviceUseCase: {
      execute: jest.fn(),
      uniqueName: "device",
    },
    updateNotificationPreferencesUseCase: {
      execute: jest.fn(),
      uniqueName: "save",
    },
  },
}));

const calls: Record<string, jest.Mock> = {
  delete: jest.fn(),
  device: jest.fn(),
  save: jest.fn(),
  test: jest.fn(),
};
const enable = jest.fn();
let status: Record<string, unknown>;

function setup(data: unknown = { tickMinutes: 30, timeZone: "UTC" }) {
  jest.mocked(useQuery).mockReturnValue({ data, isFetching: false } as never);
  jest
    .mocked(usePushDevice)
    .mockReturnValue({ deviceId: "d-1", enable } as never);
  jest.mocked(useMutation).mockImplementation(((options: {
    cacheKey: string[];
  }) => ({
    error: status[`${options.cacheKey[0]}Error`] ?? null,
    mutate: calls[options.cacheKey[0]],
    status: status[`${options.cacheKey[0]}Status`] ?? "idle",
  })) as never);

  return renderHook(() => useNotificationSettingsViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
  status = {};
});

it("SHOULD offer the times in steps of the tick interval", () => {
  const { result } = setup();

  expect(result.current.times.slice(0, 3)).toEqual(["00:00", "00:30", "01:00"]);
  expect(result.current.times).toHaveLength(48);
  expect(result.current.timeZone).toBe("UTC");
});

it("SHOULD fall back to 15 minutes AND the device time zone WHEN the preferences are not loaded", () => {
  const { result } = setup(null);

  expect(result.current.times).toHaveLength(96);
  expect(result.current.timeZone).toBe("America/Sao_Paulo");
});

it("SHOULD save each change with its own patch", () => {
  const { result } = setup();

  result.current.onTypeToggle("STOCK_EXPIRING", false);
  result.current.onLeadDaysChange("FINANCE_BILL_DUE", 5);
  result.current.onLeadDaysChange("FINANCE_INVOICE_DUE", 2);
  result.current.onSummaryTimeChange("09:00");
  result.current.onQuietStartChange("23:00");
  result.current.onQuietEndChange("06:00");
  result.current.onFamilyToggle("f1", false);

  expect(calls.save.mock.calls.map((call) => call[0])).toEqual([
    { types: { STOCK_EXPIRING: false } },
    { billLeadDays: 5 },
    { invoiceLeadDays: 2 },
    { summaryTime: "09:00" },
    { quietStart: "23:00" },
    { quietEnd: "06:00" },
    { families: [{ enabled: false, familyId: "f1" }] },
  ]);
});

it("SHOULD toggle, remove, enable AND test the devices", async () => {
  const { result } = setup();

  result.current.onDeviceToggle("d-1", false);
  result.current.onDeviceRemove("d-2");
  result.current.onTest();
  await result.current.onEnableHere();

  expect(calls.device).toHaveBeenCalledWith({ enabled: false, id: "d-1" });
  expect(calls.delete).toHaveBeenCalledWith({ id: "d-2" });
  expect(calls.test).toHaveBeenCalledWith({ deviceId: "d-1" });
  expect(enable).toHaveBeenCalledTimes(1);
});

it("SHOULD show the quiet hours copy for a 422 AND the generic copy for other failures", () => {
  status.saveError = new ApiBusinessError("x", 422);
  expect(setup().result.current.errorKey).toBe(
    "notifications.settings.summaryInQuiet",
  );

  status.saveError = new ApiBusinessError("x", 400);
  expect(setup().result.current.errorKey).toBe("notifications.settings.error");

  status = { deviceError: new Error("x") };
  expect(setup().result.current.errorKey).toBe("notifications.settings.error");

  status = {};
  expect(setup().result.current.errorKey).toBeUndefined();
});

it("SHOULD report the test as sent", () => {
  status.testStatus = "success";

  expect(setup().result.current.testSent).toBe(true);
});
