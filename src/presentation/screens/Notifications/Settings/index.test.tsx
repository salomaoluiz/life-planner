import { fireEvent, render, screen } from "@tests";

import { notificationSettingsTestIds as ids } from "../testIds";
import NotificationSettings from "./";
import { useNotificationSettingsViewModel } from "./hooks";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const base = {
  data: {
    billLeadDays: 3,
    families: [{ enabled: true, familyId: "f1", name: "Casa" }],
    invoiceLeadDays: 4,
    quietEnd: "07:00",
    quietStart: "22:00",
    summaryTime: "08:00",
    types: {
      FINANCE_BILL_DUE: true,
      FINANCE_INVOICE_DUE: false,
      STOCK_EXPIRING: true,
      STOCK_OPENED_EXPIRING: true,
    },
  },
  device: {
    deviceId: "d-1",
    devices: [
      { enabled: true, id: "d-1", name: "iPhone", platform: "IOS" },
      { enabled: false, id: "d-2", name: "Chrome", platform: "WEB" },
    ],
    isEnabling: false,
    isRegistered: true,
    needsHomeScreenInstall: false,
    permission: "granted",
  },
  errorKey: undefined,
  onDeviceRemove: jest.fn(),
  onDeviceToggle: jest.fn(),
  onEnableHere: jest.fn(),
  onFamilyToggle: jest.fn(),
  onLeadDaysChange: jest.fn(),
  onQuietEndChange: jest.fn(),
  onQuietStartChange: jest.fn(),
  onSummaryTimeChange: jest.fn(),
  onTest: jest.fn(),
  onTypeToggle: jest.fn(),
  testSent: false,
  times: ["07:00", "08:00", "22:00"],
  timeZone: "America/Sao_Paulo",
};

function setup(overrides: Record<string, unknown> = {}) {
  jest
    .mocked(useNotificationSettingsViewModel)
    .mockReturnValue({ ...base, ...overrides } as never);

  return render(<NotificationSettings />);
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD render the four types AND the screen", () => {
  setup();

  expect(screen.getByTestId(ids.screen)).toBeOnTheScreen();
  [
    "STOCK_EXPIRING",
    "STOCK_OPENED_EXPIRING",
    "FINANCE_BILL_DUE",
    "FINANCE_INVOICE_DUE",
  ].forEach((type) =>
    expect(screen.getByTestId(`${ids.typeSwitch}-${type}`)).toBeOnTheScreen(),
  );
});

it("SHOULD show lead days only for the finance types AND step them", () => {
  setup();

  expect(screen.queryByTestId(`${ids.leadDays}-STOCK_EXPIRING`)).toBeNull();
  fireEvent.press(
    screen.getByTestId(`${ids.leadDays}-FINANCE_BILL_DUE-increase`),
  );

  expect(base.onLeadDaysChange).toHaveBeenCalledWith("FINANCE_BILL_DUE", 4);
});

it("SHOULD toggle a family AND a type", () => {
  setup();

  fireEvent(screen.getByTestId(`${ids.family}-f1`), "valueChange", false);

  expect(base.onFamilyToggle).toHaveBeenCalledTimes(1);
});

it("SHOULD list the devices with this one marked, remove one AND send the test", () => {
  setup();

  expect(screen.getByTestId(`${ids.device}-d-1`)).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(`${ids.deviceRemove}-d-2`));
  fireEvent.press(screen.getByTestId(ids.test));

  expect(base.onDeviceRemove).toHaveBeenCalledWith("d-2");
  expect(base.onTest).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId(ids.enableHere)).toBeNull();
});

it("SHOULD offer to turn on this device WHEN it is not registered, AND explain the Home Screen on iOS web", () => {
  setup({
    device: {
      ...base.device,
      deviceId: null,
      isRegistered: false,
      needsHomeScreenInstall: true,
    },
  });

  fireEvent.press(screen.getByTestId(ids.enableHere));

  expect(base.onEnableHere).toHaveBeenCalledTimes(1);
  expect(screen.getByText("notifications.permission.iosWeb")).toBeOnTheScreen();
});

it("SHOULD not offer to turn on WHEN push is unsupported, show the error AND hide families without any", () => {
  setup({
    data: { ...base.data, families: [] },
    device: { ...base.device, isRegistered: false, permission: "unsupported" },
    errorKey: "notifications.settings.error",
    testSent: true,
  });

  expect(screen.queryByTestId(ids.enableHere)).toBeNull();
  expect(screen.getByText("notifications.settings.error")).toBeOnTheScreen();
  expect(screen.getByText("notifications.settings.testSent")).toBeOnTheScreen();
  expect(screen.queryByText("notifications.settings.families")).toBeNull();
});

it("SHOULD render before the preferences load", () => {
  setup({ data: undefined });

  expect(screen.getByTestId(ids.screen)).toBeOnTheScreen();
});
