import { act, renderHook } from "@testing-library/react-native";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";

import { currentMonthKey, WASTE_OWNER_ALL } from "../models/WasteUIModel";
import useStockWasteViewModel from "./useStockWasteViewModel";

jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Financial/hooks/useActiveOwners");
jest.mock("@presentation/i18n", () => ({
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getWasteUseCase: { execute: jest.fn(), uniqueName: "get_waste" },
  },
}));

const owners = [
  new OwnerDTO({ id: "u", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "f", name: "Casa", type: OwnerType.FAMILY }),
];
const refetch = jest.fn();

function setup(data: unknown = undefined, extra: Record<string, unknown> = {}) {
  jest.mocked(useActiveOwners).mockReturnValue({ data: owners } as never);
  jest
    .mocked(useQuery)
    .mockReturnValue({ data, isFetching: false, refetch, ...extra } as never);

  return renderHook(() => useStockWasteViewModel());
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD start on the current month for every owner", () => {
  const { result } = setup();

  expect(result.current.ownerId).toBe(WASTE_OWNER_ALL);
  expect(result.current.tab).toBe("reason");
  expect(jest.mocked(useQuery).mock.calls[0][0].cacheKey).toEqual([
    "get_waste",
    currentMonthKey(),
    "",
    "top",
  ]);
});

it("SHOULD list the owners as chips with the person flagged", () => {
  const { result } = setup();

  expect(result.current.ownerOptions).toEqual([
    { id: "u", isUser: true, name: "Ana" },
    { id: "f", isUser: false, name: "Casa" },
  ]);
});

it("SHOULD move the month with the arrows", () => {
  const { result } = setup();
  const now = currentMonthKey();

  act(() => result.current.onMonthPrevious());

  expect(jest.mocked(useQuery).mock.lastCall?.[0].cacheKey?.[1]).not.toBe(now);

  act(() => result.current.onMonthNext());

  expect(jest.mocked(useQuery).mock.lastCall?.[0].cacheKey?.[1]).toBe(now);
});

it("SHOULD filter by owner, load all the items on demand AND reset it when the owner changes", async () => {
  const { result } = setup();

  act(() => result.current.onShowAll());
  expect(jest.mocked(useQuery).mock.lastCall?.[0].cacheKey?.[3]).toBe("all");

  act(() => result.current.onOwnerChange("f"));
  expect(jest.mocked(useQuery).mock.lastCall?.[0].cacheKey).toEqual([
    "get_waste",
    currentMonthKey(),
    "f",
    "top",
  ]);

  await jest.mocked(useQuery).mock.lastCall?.[0].fetch();
  expect(useCases.getWasteUseCase.execute).toHaveBeenCalledWith({
    all: false,
    month: currentMonthKey(),
    ownerId: "f",
  });
});

it("SHOULD report the load error only without data AND be loading on the first fetch", () => {
  expect(
    setup(undefined, { error: new Error("x") }).result.current.errorKey,
  ).toBe("stock.waste.error");
  expect(setup(undefined, { isFetching: true }).result.current.isLoading).toBe(
    true,
  );
  expect(setup().result.current.model).toBeUndefined();
});

it("SHOULD build the model once the data arrives AND change the tab", () => {
  const data = {
    byCategory: [],
    byReason: [],
    month: currentMonthKey(),
    moreItemsCount: 0,
    previousMonth: [],
    summary: { discardCount: 0, itemCount: 0, unpricedCount: 0 },
    topItems: [],
    totals: [],
  };
  const { result } = setup(data);

  expect(result.current.model?.isEmpty).toBe(true);

  act(() => result.current.onTabChange("items"));

  expect(result.current.tab).toBe("items");
});
