import { fireEvent, render, screen } from "@tests";

import notificationsTestIds from "@screens/Notifications/testIds";

import NotificationPermissionCard from "./";
import useNotificationPermissionCardViewModel from "./hooks/useNotificationPermissionCardViewModel";

jest.unmock("@screens/Notifications/containers/NotificationPermissionCard");
jest.mock("./hooks/useNotificationPermissionCardViewModel");

const vm = {
  canOpenSettings: true,
  count: 5,
  isEnabling: false,
  mode: "invite",
  onEnable: jest.fn(),
  onLater: jest.fn(),
  onOpenSettings: jest.fn(),
  summaryTime: "08:00",
};

function setup(overrides: Record<string, unknown> = {}) {
  jest
    .mocked(useNotificationPermissionCardViewModel)
    .mockReturnValue({ ...vm, ...overrides } as never);

  return render(<NotificationPermissionCard />);
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD explain first AND offer Ativar and Agora não", () => {
  setup();

  fireEvent.press(screen.getByTestId(notificationsTestIds.permissionEnable));
  fireEvent.press(screen.getByTestId(notificationsTestIds.permissionLater));

  expect(screen.getByText("notifications.permission.title")).toBeOnTheScreen();
  expect(vm.onEnable).toHaveBeenCalledTimes(1);
  expect(vm.onLater).toHaveBeenCalledTimes(1);
});

it("SHOULD render nothing WHEN hidden", () => {
  setup({ mode: "hidden" });

  expect(screen.queryByTestId(notificationsTestIds.permissionCard)).toBeNull();
});

it("SHOULD explain the Home Screen on iOS web", () => {
  setup({ mode: "ios-web" });

  expect(screen.getByText("notifications.permission.iosWeb")).toBeOnTheScreen();
});

it("SHOULD offer the device settings WHEN blocked on native AND the browser way on the web", () => {
  setup({ mode: "blocked" });
  fireEvent.press(screen.getAllByText("notifications.permission.blocked")[1]);
  expect(vm.onOpenSettings).toHaveBeenCalledTimes(1);

  setup({ canOpenSettings: false, mode: "blocked" });
  expect(
    screen.getByText("notifications.permission.blockedWeb"),
  ).toBeOnTheScreen();
});
