import { useIsFocused } from "@react-navigation/native";
import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useStockViewModel, { fetchStock } from "./useStockViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/i18n/useTranslationLocale", () => ({
  __esModule: true,
  default: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "get_owners" },
    getStockItemsUseCase: { execute: jest.fn(), uniqueName: "get_stock" },
  },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Silva", type: OwnerType.FAMILY }),
];
const items = [
  new StockDTO({
    description: "Leite",
    id: "stock-1",
    owner: StockOwners.USER,
    ownerId: "user-id",
    quantity: 2,
    unit: StockUnits.LITER,
  }),
  new StockDTO({
    description: "Arroz",
    id: "stock-2",
    owner: StockOwners.FAMILY,
    ownerId: "family-1",
    quantity: 1,
    unit: StockUnits.KILOGRAM,
  }),
];
const data = { items, owners };

const query = new UseQueryFixture<typeof data>();
let built = query.build();

const spies = {
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  getStock: jest.mocked(useCases.getStockItemsUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  params: jest.mocked(useLocalSearchParams),
  push: jest.mocked(router.push),
  useQuery: jest.mocked(useQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 5, 10, 0));
  spies.isFocused.mockReturnValue(false);
  spies.params.mockReturnValue({});
});
afterEach(() => {
  jest.useRealTimers();
});

function setup(
  configure: (q: UseQueryFixture<typeof data>) => void = (q) =>
    q.withData(data),
) {
  query.reset();
  configure(query);
  built = query.build();
  spies.useQuery.mockImplementation(() => built as never);

  return renderHook(() => useStockViewModel());
}

describe("states", () => {
  it("SHOULD be loading WHEN fetching without data", () => {
    const { result } = setup((q) => q.withIsFetching(true));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRefreshing).toBe(false);
  });

  it("SHOULD be refreshing WHEN fetching with data", () => {
    const { result } = setup((q) => q.withData(data).withIsFetching(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
  });

  it("SHOULD expose the generic error WHEN the query failed without data", () => {
    const { result } = setup((q) => q.withError());

    expect(result.current.errorMessageKey).toBe("common.errors.generic");
  });

  it("SHOULD be empty WHEN loaded with zero items", () => {
    const { result } = setup((q) => q.withData({ items: [], owners }));

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.errorMessageKey).toBeUndefined();
  });

  it("SHOULD report the subtitle of the whole list, not of the search", () => {
    const { result } = setup();

    act(() => {
      result.current.onSearchChange("zzz");
    });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.subtitle).toEqual({ attention: 0, total: 2 });
    expect(result.current.hasNoResults).toBe(true);
  });
});

describe("fetchStock", () => {
  it("SHOULD fetch the owners and then their items", async () => {
    spies.getOwners.mockResolvedValue(owners);
    spies.getStock.mockResolvedValue(items);

    const result = await fetchStock();

    expect(spies.getStock).toHaveBeenCalledWith({
      ownerIds: ["user-id", "family-1"],
    });
    expect(result).toEqual({ items, owners });
  });
});

describe("search and filters", () => {
  it("SHOULD debounce the search but update the raw value at once", () => {
    const { result } = setup();

    act(() => {
      result.current.onSearchChange("arr");
    });

    expect(result.current.search).toBe("arr");
    expect(result.current.rows.filter((r) => r.kind === "item")).toHaveLength(
      2,
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.rows.filter((r) => r.kind === "item")).toHaveLength(
      1,
    );
  });

  it("SHOULD reset search and filter but keep the sort WHEN clearing", () => {
    const { result } = setup();

    act(() => {
      result.current.onSortChange("NAME");
    });
    act(() => {
      result.current.onFilterChange("PERSONAL");
    });
    act(() => {
      result.current.onSearchChange("leite");
    });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    act(() => {
      result.current.onClearFilters();
    });

    expect(result.current.search).toBe("");
    expect(result.current.activeFilter).toBe("ALL");
    expect(result.current.sort).toBe("NAME");
    expect(result.current.rows.filter((r) => r.kind === "item")).toHaveLength(
      2,
    );
  });

  it("SHOULD change the active filter", () => {
    const { result } = setup();

    act(() => {
      result.current.onFilterChange("EXPIRING");
    });

    expect(result.current.activeFilter).toBe("EXPIRING");
  });

  it("SHOULD fall back to ALL WHEN the family disappears", () => {
    const { rerender, result } = setup();

    act(() => {
      result.current.onFilterChange("family-1");
    });
    expect(result.current.activeFilter).toBe("family-1");

    query.withData({ items, owners: [owners[0]] });
    built = query.build();
    rerender({});

    expect(result.current.activeFilter).toBe("ALL");
  });
});

describe("route param", () => {
  it("SHOULD select Expiring on mount WHEN filter=EXPIRING", () => {
    spies.params.mockReturnValue({ filter: "EXPIRING" });

    const { result } = setup();

    expect(result.current.activeFilter).toBe("EXPIRING");
  });

  it("SHOULD ignore an unknown filter", () => {
    spies.params.mockReturnValue({ filter: "bogus" });

    const { result } = setup();

    expect(result.current.activeFilter).toBe("ALL");
  });

  it("SHOULD apply a new value WHEN the param changes", () => {
    const { rerender, result } = setup();

    spies.params.mockReturnValue({ filter: "EXPIRED" });
    rerender({});

    expect(result.current.activeFilter).toBe("EXPIRED");
  });
});

describe("route param consumption", () => {
  it("SHOULD clear the param once applied so a repeated See all re-applies it", () => {
    spies.params.mockReturnValue({ filter: "EXPIRING" });
    const { rerender, result } = setup();

    expect(result.current.activeFilter).toBe("EXPIRING");
    expect(jest.mocked(router.setParams)).toHaveBeenCalledWith({
      filter: undefined,
    });

    act(() => {
      result.current.onFilterChange("ALL");
    });
    // the router now reports the cleared param
    spies.params.mockReturnValue({});
    rerender({});
    expect(result.current.activeFilter).toBe("ALL");

    // Home "See all" pushes the same value again
    spies.params.mockReturnValue({ filter: "EXPIRING" });
    rerender({});
    expect(result.current.activeFilter).toBe("EXPIRING");
  });

  it("SHOULD NOT clear anything WHEN the filter param is absent or unknown", () => {
    spies.params.mockReturnValue({ filter: "bogus" });
    setup();

    expect(jest.mocked(router.setParams)).not.toHaveBeenCalled();
  });
});

describe("details", () => {
  it("SHOULD select and close an item", () => {
    const { result } = setup();

    act(() => {
      result.current.onItemPress("stock-1");
    });
    expect(result.current.selectedItem?.id).toBe("stock-1");

    act(() => {
      result.current.onCloseDetails();
    });
    expect(result.current.selectedItem).toBeUndefined();
  });

  it("SHOULD clear the selection WHEN a refetch removes the item", () => {
    const { rerender, result } = setup();

    act(() => {
      result.current.onItemPress("stock-1");
    });
    query.withData({ items: [items[1]], owners });
    built = query.build();
    rerender({});

    expect(result.current.selectedItem).toBeUndefined();
  });

  it("SHOULD close the details and refetch WHEN the item is deleted", () => {
    const { result } = setup();

    act(() => {
      result.current.onItemPress("stock-1");
    });
    act(() => {
      result.current.onItemDeleted();
    });

    expect(result.current.selectedItem).toBeUndefined();
    expect(built.refetch).toHaveBeenCalled();
  });
});

describe("sort sheet", () => {
  it("SHOULD open, change the sort and close", () => {
    const { result } = setup();

    act(() => {
      result.current.onOpenSort();
    });
    expect(result.current.isSortOpen).toBe(true);

    act(() => {
      result.current.onSortChange("NAME");
    });
    expect(result.current.sort).toBe("NAME");
    expect(result.current.isSortOpen).toBe(false);
  });

  it("SHOULD close the sheet WHEN dismissed", () => {
    const { result } = setup();

    act(() => {
      result.current.onOpenSort();
    });
    act(() => {
      result.current.onCloseSort();
    });

    expect(result.current.isSortOpen).toBe(false);
  });

  it("SHOULD list Expiration, Name and Recent", () => {
    const { result } = setup();

    expect(result.current.sortOptions).toEqual([
      { labelKey: "stock.list.sort.expiration", value: "EXPIRATION" },
      { labelKey: "stock.list.sort.name", value: "NAME" },
      { labelKey: "stock.list.sort.recent", value: "RECENT" },
    ]);
  });
});

describe("focus and refresh", () => {
  it("SHOULD refetch WHEN focused", () => {
    setup();
    spies.isFocused.mockReturnValue(true);
    setup();

    expect(built.refetch).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT refetch WHEN not focused", () => {
    setup();

    expect(built.refetch).not.toHaveBeenCalled();
  });

  it("SHOULD refetch on refresh and retry", () => {
    const { result } = setup();

    act(() => {
      result.current.onRefresh();
    });
    act(() => {
      result.current.onRetry();
    });

    expect(built.refetch).toHaveBeenCalledTimes(2);
  });
});

describe("onAddPress", () => {
  it("SHOULD push the plain route WHEN a status filter is active", () => {
    const { result } = setup();

    act(() => {
      result.current.onFilterChange("EXPIRING");
    });
    act(() => {
      result.current.onAddPress();
    });

    expect(spies.push).toHaveBeenCalledWith({
      pathname: "/stock/add_new_stock_item",
    });
  });

  it("SHOULD pass the ownerId WHEN a family filter is active", () => {
    const { result } = setup();

    act(() => {
      result.current.onFilterChange("family-1");
    });
    act(() => {
      result.current.onAddPress();
    });

    expect(spies.push).toHaveBeenCalledWith({
      params: { ownerId: "family-1" },
      pathname: "/stock/add_new_stock_item",
    });
  });
});
