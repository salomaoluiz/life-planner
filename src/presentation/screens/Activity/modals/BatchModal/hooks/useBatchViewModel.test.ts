import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useMutation, useQuery } from "@infrastructure/fetcher";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import useBatchViewModel from "./useBatchViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));
jest.mock("@screens/Navigation/hooks/useModalNavigation", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("@presentation/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "pt-BR" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getActivityItemsUseCase: { execute: jest.fn(), uniqueName: "items" },
  },
}));
jest.useFakeTimers();

const closeModal = jest.fn();
const openModal = jest.fn();
const loadMore = jest.fn();
let first: Record<string, unknown>;
let more: Record<string, unknown>;

function item(id: string, over: Record<string, unknown> = {}) {
  return {
    action: "CREATE",
    amountCents: -2350,
    bookingDate: "2026-10-31",
    currency: "BRL",
    entityId: id,
    entityType: "TRANSACTION",
    itemExists: true,
    label: id,
    sourceName: "Conta",
    ...over,
  };
}

function setup(params: Record<string, string> = {}) {
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ assetId: "", id: "a-1", ...params } as never);
  jest
    .mocked(useModalNavigation)
    .mockReturnValue({ closeModal, openModal } as never);
  jest.mocked(useQuery).mockImplementation((() => first) as never);
  jest.mocked(useMutation).mockImplementation((() => more) as never);

  return renderHook(() => useBatchViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
  first = {
    data: {
      header: {
        bookingFrom: "2026-10-01",
        bookingTo: "2026-10-31",
        count: 2,
        existing: 1,
        sources: ["Conta"],
        totals: [{ amountCents: -4700, currency: "BRL" }],
      },
      items: [
        item("i-1"),
        item("i-2", { action: "DELETE", itemExists: false }),
      ],
      nextCursor: "c1",
    },
    isFetching: false,
  };
  more = { data: undefined, isFetching: false, mutate: loadMore };
});

it("SHOULD map the header AND the items, with open only for items that exist", () => {
  const { result } = setup({
    file: "f.csv",
    owner: "Pessoal",
    title: "t",
    when: "w",
  });

  expect(result.current.header).toMatchObject({
    count: 2,
    existing: 1,
    sources: "Conta",
  });
  expect(result.current.header?.dates).toContain("–");
  expect(result.current.rows.map((row) => row.canOpen)).toEqual([true, false]);
  expect(result.current.file).toBe("f.csv");
  expect(result.current.hasNext).toBe(true);
});

it("SHOULD page with the cursor AND append the next page", () => {
  const { rerender, result } = setup();

  act(() => result.current.onLoadMore());
  expect(loadMore).toHaveBeenCalledWith("c1");

  more = {
    data: { header: null, items: [item("i-3")], nextCursor: null },
    isFetching: false,
    mutate: loadMore,
  };
  rerender({});

  expect(result.current.rows).toHaveLength(3);
  expect(result.current.hasNext).toBe(false);
});

it("SHOULD debounce the search", () => {
  const { result } = setup();

  act(() => result.current.onSearchChange("padaria"));
  act(() => jest.advanceTimersByTime(400));

  expect(jest.mocked(useQuery).mock.calls.at(-1)?.[0].cacheKey).toContain(
    "padaria",
  );
});

it("SHOULD close the batch AND open the item in its modal or route", () => {
  const { result } = setup();

  act(() => result.current.onOpen(0));
  expect(closeModal).toHaveBeenCalled();
  expect(openModal).toHaveBeenCalledWith("add_new_transaction", { id: "i-1" });

  first = {
    data: {
      header: null,
      items: [item("o-1", { entityType: "CONVERSION" })],
      nextCursor: null,
    },
    isFetching: false,
  };
  const other = setup({ assetId: "asset-1" });

  act(() => other.result.current.onOpen(0));
  expect(router.push).toHaveBeenCalledWith("/investments/asset/asset-1");

  act(() => result.current.onOpen(1));
  expect(openModal).toHaveBeenCalledTimes(1);
});

it("SHOULD report loading AND have no header while the first page loads", () => {
  first = { data: undefined, isFetching: true };

  const { result } = setup();

  expect(result.current.isLoading).toBe(true);
  expect(result.current.header).toBeNull();
});
