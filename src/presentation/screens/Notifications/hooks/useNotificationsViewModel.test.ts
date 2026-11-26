import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useCases } from "@application/useCases";
import { useMutation, useQuery } from "@infrastructure/fetcher";

import useNotificationsViewModel from "./useNotificationsViewModel";
import usePushDevice from "./usePushDevice";
import useUnreadCount from "./useUnreadCount";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher", () => ({
  invalidateFetcherData: jest.fn().mockResolvedValue(undefined),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));
jest.mock("./usePushDevice");
jest.mock("./useUnreadCount");
jest.mock("@presentation/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "pt-BR" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getNotificationPreferencesUseCase: {
      execute: jest.fn(),
      uniqueName: "prefs",
    },
    getNotificationsUseCase: { execute: jest.fn(), uniqueName: "list" },
    markAllNotificationsReadUseCase: { execute: jest.fn(), uniqueName: "all" },
    markNotificationReadUseCase: { execute: jest.fn(), uniqueName: "read" },
  },
}));

function notice(id: string, readAt: null | string = null) {
  return {
    createdAt: "2026-11-23T11:00:00.000Z",
    id,
    items: [],
    kind: "SUMMARY",
    localDate: "2026-11-23",
    readAt,
    title: id,
  };
}
const mutate = {
  loadMore: jest.fn(),
  read: jest.fn(),
  readAll: jest.fn(),
};
let state: Record<string, unknown>;

function setup(
  overrides: { list?: unknown; params?: unknown; preferences?: unknown } = {},
) {
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue((overrides.params ?? {}) as never);
  jest
    .mocked(useUnreadCount)
    .mockReturnValue({ count: 2, refetch: jest.fn() } as never);
  jest.mocked(usePushDevice).mockReturnValue({} as never);
  // Stable objects: a new `data` on every render would re-run the effects forever.
  const preferences = overrides.preferences ?? { data: { types: { A: true } } };
  const list = overrides.list ?? {
    data: { items: [notice("n-1"), notice("n-2", "x")], nextCursor: "c1" },
    isFetching: false,
    refetch: jest.fn(),
  };
  const mutations = {
    loadMore: {
      data: state.loadMoreData,
      isFetching: false,
      mutate: mutate.loadMore,
      status: "idle",
    },
    read: {
      data: undefined,
      isFetching: false,
      mutate: mutate.read,
      status: "idle",
    },
    readAll: {
      data: undefined,
      isFetching: false,
      mutate: mutate.readAll,
      status: "idle",
    },
  };
  jest
    .mocked(useQuery)
    .mockImplementation(((options: { cacheKey: string[] }) =>
      options.cacheKey[1] === "preferences" ? preferences : list) as never);
  const byKey: Record<string, unknown> = {
    all: mutations.readAll,
    read: mutations.read,
  };
  jest
    .mocked(useMutation)
    .mockImplementation(
      ((options: { cacheKey: string[] }) =>
        byKey[options.cacheKey[0]] ?? mutations.loadMore) as never,
    );

  return renderHook(() => useNotificationsViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
  state = {};
});

it("SHOULD group the notices by day AND report there is a next page", () => {
  const { result } = setup();

  expect(result.current.days[0].rows.map((row) => row.id)).toEqual([
    "n-1",
    "n-2",
  ]);
  expect(result.current.hasNext).toBe(true);
  expect(result.current.unreadCount).toBe(2);
  expect(result.current.isLoading).toBe(false);
  expect(result.current.isEmpty).toBe(false);
  expect(result.current.allTypesOff).toBe(false);
});

it("SHOULD read with the filter of the chosen chip AND reset on a filter change", () => {
  const { result } = setup();

  act(() => result.current.onFilterChange("STOCK"));

  expect(result.current.filter).toBe("STOCK");
  const options = jest.mocked(useQuery).mock.calls.at(-2)?.[0] as {
    cacheKey: string[];
    fetch: () => unknown;
  };
  void options.fetch();
  expect(useCases.getNotificationsUseCase.execute).toHaveBeenLastCalledWith({
    module: "STOCK",
  });
});

it.each([
  ["unread", { unread: true }],
  ["all", {}],
])("SHOULD translate the %s chip into the API filter", (chip, expected) => {
  const { result } = setup();

  act(() => result.current.onFilterChange(chip));
  const options = jest.mocked(useQuery).mock.calls.at(-2)?.[0] as {
    fetch: () => unknown;
  };
  void options.fetch();

  expect(useCases.getNotificationsUseCase.execute).toHaveBeenLastCalledWith(
    expected,
  );
});

it("SHOULD select the notice AND mark it read only WHEN it was unread", () => {
  const { result } = setup();
  const [unread, read] = result.current.days[0].rows;

  act(() => result.current.onNoticePress(unread));
  act(() => result.current.onNoticePress(read));

  expect(result.current.selectedId).toBe(read.id);
  expect(mutate.read).toHaveBeenCalledTimes(1);
  expect(mutate.read).toHaveBeenCalledWith({ id: "n-1" });
});

it("SHOULD mark a notice opened from a web push (?notice=) read once it is listed", () => {
  setup({ params: { notice: "n-1" } });

  expect(mutate.read).toHaveBeenCalledWith({ id: "n-1" });
});

it("SHOULD open the item target, the settings AND mark everything read", () => {
  const { result } = setup();

  result.current.onItemPress("/finance/transactions/tx-1");
  result.current.onSettingsPress();
  result.current.onMarkAllRead();

  expect(router.push).toHaveBeenCalledWith({
    params: { id: "tx-1" },
    pathname: "/financial/transaction/add_new_transaction",
  });
  expect(router.push).toHaveBeenCalledWith("/notification-settings");
  expect(mutate.readAll).toHaveBeenCalledTimes(1);
});

it("SHOULD append the next page AND follow its cursor", () => {
  state.loadMoreData = { items: [notice("n-3")], nextCursor: null };
  const { result } = setup();

  expect(result.current.days[0].rows.map((row) => row.id)).toEqual([
    "n-1",
    "n-2",
    "n-3",
  ]);
  expect(result.current.hasNext).toBe(false);
});

it("SHOULD ask for the next page with the cursor", () => {
  const { result } = setup();

  result.current.onLoadMore();

  expect(mutate.loadMore).toHaveBeenCalledWith("c1");
});

it("SHOULD show the empty state, the error AND the all-off state", () => {
  const empty = setup({
    list: { data: { items: [], nextCursor: null }, isFetching: false },
  });
  expect(empty.result.current.isEmpty).toBe(true);
  expect(empty.result.current.hasNext).toBe(false);

  const error = setup({
    list: {
      data: undefined,
      error: new Error("x"),
      isFetching: false,
      refetch: jest.fn(),
    },
  });
  expect(error.result.current.errorKey).toBe("notifications.error");
  expect(error.result.current.isEmpty).toBe(false);

  const off = setup({
    preferences: { data: { types: { A: false, B: false } } },
  });
  expect(off.result.current.allTypesOff).toBe(true);

  const loading = setup({ list: { data: undefined, isFetching: true } });
  expect(loading.result.current.isLoading).toBe(true);
});

it("SHOULD refetch the list on retry", async () => {
  const refetch = jest.fn();
  const { result } = setup({
    list: { data: { items: [], nextCursor: null }, isFetching: false, refetch },
  });

  await result.current.onRetry();

  expect(refetch).toHaveBeenCalledTimes(1);
});
