import { act, renderHook } from "@testing-library/react-native";
import { router, usePathname } from "expo-router";

import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import useActivityViewModel from "./useActivityViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  usePathname: jest.fn(),
}));
jest.mock("@infrastructure/fetcher", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));
jest.mock("@presentation/hooks/useOwners", () => ({
  __esModule: true,
  default: jest.fn(),
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
  useCases: { getActivityUseCase: { execute: jest.fn(), uniqueName: "list" } },
}));
jest.useFakeTimers();

const openModal = jest.fn();
const loadMore = jest.fn();
let list: Record<string, unknown>;
let more: Record<string, unknown>;

function entry(id: string, actorId: null | string = "u-1") {
  return {
    action: "CREATE",
    actor: { id: actorId, name: "Ana" },
    batch: false,
    batchPreview: null,
    changes: null,
    entityId: `e-${id}`,
    entityType: "TRANSACTION",
    id,
    itemExists: true,
    modules: ["FINANCE"],
    occurredAt: new Date().toISOString(),
    owner: { id: "f-1", name: "Família", type: "FAMILY" },
    summary: { label: id },
  };
}

function setup(
  path = "/financial/history",
  owners: undefined | unknown[] = undefined,
) {
  jest.mocked(usePathname).mockReturnValue(path);
  jest.mocked(useModalNavigation).mockReturnValue({ openModal } as never);
  jest.mocked(useOwners).mockReturnValue({
    data: owners ?? [
      { id: "u-1", name: "Ana", type: "USER" },
      { id: "f-1", name: "Família", type: "FAMILY" },
    ],
  } as never);
  jest.mocked(useQuery).mockImplementation((() => list) as never);
  jest.mocked(useMutation).mockImplementation((() => more) as never);

  return renderHook(() => useActivityViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
  list = {
    data: { items: [entry("a-1"), entry("a-2", "u-2")], nextCursor: "c1" },
    error: undefined,
    isFetching: false,
    refetch: jest.fn(),
  };
  more = { data: undefined, isFetching: false, mutate: loadMore };
});

it("SHOULD open on the module of the route AND group the entries by day", () => {
  const { result } = setup("/investments/history");

  expect(result.current.module).toBe("INVESTMENT");
  expect(result.current.days[0].rows.map((row) => row.id)).toEqual([
    "a-1",
    "a-2",
  ]);
  expect(result.current.hasNext).toBe(true);
  expect(result.current.hasFamily).toBe(true);
  expect(result.current.actorChoices.map((choice) => choice.value)).toEqual([
    "u-1",
    "u-2",
  ]);
});

it("SHOULD read the filters of the chosen chips AND clear them", () => {
  const { result } = setup();

  act(() => {
    result.current.onActionChange("BATCH");
    result.current.onPeriodChange("7d");
    result.current.onOwnerChange("f-1");
    result.current.onActorChange("u-2");
  });

  expect(result.current.filters).toMatchObject({
    action: "BATCH",
    actorId: "u-2",
    ownerId: "f-1",
    period: "7d",
  });
  expect(result.current.filterCount).toBe(4);

  act(() => result.current.onClearFilters());

  expect(result.current.filterCount).toBe(0);
});

it("SHOULD debounce the search before it reaches the filters", () => {
  const { result } = setup();

  act(() => result.current.onSearchChange("mercado"));
  expect(result.current.filters.q).toBe("");

  act(() => jest.advanceTimersByTime(400));
  expect(result.current.filters.q).toBe("mercado");
});

it("SHOULD append the next page AND ask for it with the cursor", () => {
  const { rerender, result } = setup();

  act(() => result.current.onLoadMore());
  expect(loadMore).toHaveBeenCalledWith("c1");

  more = {
    data: { items: [entry("a-3")], nextCursor: null },
    isFetching: false,
    mutate: loadMore,
  };
  rerender({});

  expect(
    result.current.days.flatMap((day) => day.rows).map((row) => row.id),
  ).toEqual(["a-1", "a-2", "a-3"]);
  expect(result.current.hasNext).toBe(false);
});

it("SHOULD report loading, empty AND error states", () => {
  list = {
    data: undefined,
    error: undefined,
    isFetching: true,
    refetch: jest.fn(),
  };
  expect(setup().result.current.isLoading).toBe(true);

  list = {
    data: { items: [], nextCursor: null },
    error: undefined,
    isFetching: false,
    refetch: jest.fn(),
  };
  expect(setup().result.current.isEmpty).toBe(true);

  list = {
    data: undefined,
    error: new Error("x"),
    isFetching: false,
    refetch: jest.fn(),
  };
  expect(setup().result.current.errorKey).toBe("activity.error");
});

it("SHOULD open an item in its modal or route AND the batch items with the entry data", () => {
  const { result } = setup();
  const [row] = result.current.days[0].rows;

  act(() => result.current.onOpen(row));
  expect(openModal).toHaveBeenCalledWith("add_new_transaction", {
    id: "e-a-1",
  });

  act(() =>
    result.current.onOpen({ ...row, target: { path: "/investments/asset/a" } }),
  );
  expect(router.push).toHaveBeenCalledWith("/investments/asset/a");

  act(() => result.current.onOpen({ ...row, target: null }));
  expect(openModal).toHaveBeenCalledTimes(1);

  act(() => result.current.onViewItems(row));
  expect(openModal).toHaveBeenLastCalledWith(
    "activity_batch",
    expect.objectContaining({ id: "a-1" }),
  );
});

it("SHOULD hide the owner chip data WHEN the user has no family", () => {
  const { result } = setup("/financial/history", [
    { id: "u-1", name: "Ana", type: "USER" },
  ]);

  expect(result.current.hasFamily).toBe(false);
  expect(result.current.days[0].rows[0].ownerLabel).toBe("");
});

it("SHOULD toggle the filter sheet", () => {
  const { result } = setup();

  act(() => result.current.onSheetOpen());
  expect(result.current.sheetOpen).toBe(true);
  act(() => result.current.onSheetClose());
  expect(result.current.sheetOpen).toBe(false);
});
