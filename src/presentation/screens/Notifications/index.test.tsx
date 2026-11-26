import { fireEvent, render, screen } from "@tests";

import Notifications from "./";
import useNotificationsViewModel from "./hooks/useNotificationsViewModel";
import notificationsTestIds from "./testIds";

jest.mock("./hooks/useNotificationsViewModel");
jest.mock("./containers/NotificationPermissionCard", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const row = {
  groups: [
    {
      items: [
        {
          detail: "Geladeira",
          dueLabel: "",
          key: "k1",
          label: "Iogurte natural",
          route: "/stock/items/i1",
          state: "DUE_TODAY",
          type: "STOCK_EXPIRING",
        },
      ],
      state: "DUE_TODAY",
    },
    {
      items: [
        {
          detail: "R$ 214,30",
          dueLabel: "em 2 dias",
          key: "k2",
          label: "Conta de luz",
          route: "/finance/transactions/t1",
          state: "UPCOMING",
          type: "FINANCE_BILL_DUE",
        },
      ],
      state: "UPCOMING",
    },
  ],
  id: "n-1",
  isUnread: true,
  isUrgent: true,
  itemCount: 2,
  time: "08:00",
  title: "Hoje: 1 vencem, 1 nos próximos dias",
};
const vm = {
  allTypesOff: false,
  days: [{ key: "2026-11-23", label: "Hoje", rows: [row] }],
  errorKey: undefined,
  filter: "all",
  hasNext: true,
  isEmpty: false,
  isLoading: false,
  isLoadingMore: false,
  onFilterChange: jest.fn(),
  onItemPress: jest.fn(),
  onLoadMore: jest.fn(),
  onMarkAllRead: jest.fn(),
  onNoticePress: jest.fn(),
  onRetry: jest.fn(),
  onSettingsPress: jest.fn(),
  selectedId: undefined as string | undefined,
  unreadCount: 3,
};

function setup(overrides: Record<string, unknown> = {}) {
  jest
    .mocked(useNotificationsViewModel)
    .mockReturnValue({ ...vm, ...overrides } as never);

  return render(<Notifications />);
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD list the day with the notice AND open it on press", () => {
  setup();

  expect(
    screen.getByTestId(`${notificationsTestIds.day}-2026-11-23`),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(`${notificationsTestIds.notice}-n-1`));

  expect(vm.onNoticePress).toHaveBeenCalledWith(row);
});

it("SHOULD show the groups of the selected notice AND open an item", () => {
  setup({ selectedId: "n-1" });

  fireEvent.press(screen.getByText("Iogurte natural · Geladeira"));

  expect(vm.onItemPress).toHaveBeenCalledWith("/stock/items/i1");
  expect(
    screen.getByText("Conta de luz · R$ 214,30 · em 2 dias"),
  ).toBeOnTheScreen();
});

it("SHOULD mark all as read, open the settings, change the filter AND load more", () => {
  setup();

  fireEvent.press(screen.getByTestId(notificationsTestIds.markAll));
  fireEvent.press(screen.getByTestId(notificationsTestIds.settingsButton));
  fireEvent.press(screen.getByTestId(notificationsTestIds.loadMore));

  expect(vm.onMarkAllRead).toHaveBeenCalledTimes(1);
  expect(vm.onSettingsPress).toHaveBeenCalledTimes(1);
  expect(vm.onLoadMore).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByTestId(`${notificationsTestIds.filter}-STOCK`));

  expect(vm.onFilterChange).toHaveBeenCalledWith("STOCK");
});

it("SHOULD hide Carregar mais WHEN there is no next page AND not offer mark all with nothing unread", () => {
  setup({ hasNext: false, unreadCount: 0 });

  expect(screen.queryByTestId(notificationsTestIds.loadMore)).toBeNull();
});

it("SHOULD show the loading, error, empty AND all-off states", () => {
  setup({ isLoading: true });
  expect(screen.getByTestId(notificationsTestIds.loading)).toBeOnTheScreen();

  setup({ errorKey: "notifications.error" });
  expect(screen.getByTestId(notificationsTestIds.error)).toBeOnTheScreen();

  setup({ days: [], isEmpty: true });
  expect(screen.getByTestId(notificationsTestIds.empty)).toBeOnTheScreen();

  setup({ allTypesOff: true });
  expect(screen.getByTestId(notificationsTestIds.allOff)).toBeOnTheScreen();
});
