import { useIsFocused } from "@react-navigation/native";
import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { modalNavigation } from "@tests/modalNavigation";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { ApiBusinessError, GenericError } from "@domain/entities/errors";
import { StockCatalogStatus } from "@domain/entities/stock/StockCatalogEntity";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import useStockViewModel, {
  expandCategoryIds,
  fetchCatalog,
  fetchStock,
} from "./useStockViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Stock/hooks/useStockQuickMovement", () => ({
  __esModule: true,
  default: () => ({}),
}));
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@presentation/i18n/useTranslationLocale", () => ({
  __esModule: true,
  default: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "get_owners" },
    getStockCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "get_categories",
    },
    getStockItemsUseCase: { execute: jest.fn(), uniqueName: "get_stock" },
    getStockLocationsUseCase: {
      execute: jest.fn(),
      uniqueName: "get_locations",
    },
    getStockLocationUseCase: {
      execute: jest.fn(),
      uniqueName: "get_location",
    },
  },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Silva", type: OwnerType.FAMILY }),
];
const items = [
  dto((f) =>
    f
      .withId("stock-1")
      .withDescription("Leite")
      .withUnit(StockUnits.LITER)
      .withQuantity(2),
  ),
  dto((f) =>
    f
      .withId("stock-2")
      .withDescription("Arroz")
      .withOwner(StockOwners.FAMILY)
      .withOwnerId("family-1")
      .withUnit(StockUnits.KILOGRAM)
      .withQuantity(1),
  ),
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
  useQuery: jest.mocked(useOwnerScopedQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 5, 10, 0));
  spies.isFocused.mockReturnValue(false);
  spies.params.mockReturnValue({});
  jest.mocked(useQuery).mockReturnValue({
    data: undefined,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    status: "pending",
  } as never);
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
  it("SHOULD fetch the items of the given owners AND never ask for the owners", async () => {
    spies.getStock.mockResolvedValue(items);

    const result = await fetchStock(owners);

    expect(spies.getOwners).not.toHaveBeenCalled();
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

    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "add_new_stock_item",
      undefined,
    );
  });

  it("SHOULD pass the ownerId WHEN a family filter is active", () => {
    const { result } = setup();

    act(() => {
      result.current.onFilterChange("family-1");
    });
    act(() => {
      result.current.onAddPress();
    });

    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "add_new_stock_item",
      { ownerId: "family-1" },
    );
  });
});

describe("barcode reader (spec 121)", () => {
  it("SHOULD open the reader WITHOUT an owner on a status filter", () => {
    const { result } = setup();

    act(() => {
      result.current.onScanPress();
    });

    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "stock_barcode",
      undefined,
    );
  });

  it("SHOULD open the reader with the owner of the active filter", () => {
    const { result } = setup();

    act(() => {
      result.current.onFilterChange("family-1");
    });
    act(() => {
      result.current.onScanPress();
    });

    expect(modalNavigation.openModal).toHaveBeenCalledWith("stock_barcode", {
      ownerId: "family-1",
    });
  });

  it("SHOULD open the details of the item of the `item` param AND consume it", () => {
    spies.params.mockReturnValue({ item: "item-1" });

    setup();

    expect(jest.mocked(router.setParams)).toHaveBeenCalledWith({
      item: undefined,
    });
  });
});

describe("archived family (spec 042)", () => {
  const archivedOwners = [
    owners[0],
    new OwnerDTO({
      archived: true,
      id: "family-1",
      name: "Silva",
      type: OwnerType.FAMILY,
    }),
  ];

  it("SHOULD be writable on All AND read-only on the archived family, replacing the actions by the toast", () => {
    const { result } = setup((q) =>
      q.withData({ items, owners: archivedOwners }),
    );

    expect(result.current.readOnly).toBe(false);
    expect(result.current.subtitle.total).toBe(1);

    act(() => result.current.onFilterChange("family-1"));

    expect(result.current.readOnly).toBe(true);

    act(() => {
      result.current.onAddPress();
      result.current.onItemPress("stock-2");
    });

    expect(modalNavigation.openModal).not.toHaveBeenCalled();
    expect(result.current.selectedItem).toBeUndefined();
    expect(result.current.toastVisible).toBe(true);
  });
});

describe("categories and locations (spec 116)", () => {
  const catalogData = {
    categories: [
      { id: "dairy", label: "Dairy" },
      { id: "cheese", label: "Dairy › Cheese", parentId: "dairy" },
      { id: "meat", label: "Meat" },
    ],
    locations: [{ id: "fridge", label: "Fridge" }],
  };
  const categorized = [
    dto((f) =>
      f.withId("a").withDescription("Milk").withCategory({
        archived: false,
        id: "dairy",
        name: "Dairy",
        path: "Dairy",
      }),
    ),
    dto((f) =>
      f
        .withId("b")
        .withDescription("Mozzarella")
        .withCategory({
          archived: false,
          id: "cheese",
          name: "Cheese",
          path: "Dairy / Cheese",
        })
        .withLocation({ archived: false, id: "fridge", name: "Fridge" }),
    ),
    dto((f) =>
      f.withId("c").withDescription("Steak").withCategory({
        archived: false,
        id: "meat",
        name: "Meat",
        path: "Meat",
      }),
    ),
  ];

  function setupCatalog() {
    const catalogQuery = new UseQueryFixture<typeof catalogData>();
    const catalogBuilt = catalogQuery.withData(catalogData).build();
    let call = 0;

    query.reset();
    query.withData({ items: categorized, owners });
    built = query.build();
    // The view model asks for the stock first and the catalog second, on every render.
    spies.useQuery.mockImplementation(() => {
      const current = call % 2 === 0 ? built : catalogBuilt;

      call += 1;

      return current as never;
    });

    return renderHook(() => useStockViewModel());
  }

  it("SHOULD expand a parent category to its children AND filter the rows by them", () => {
    const { result } = setupCatalog();

    act(() => result.current.onCategoriesChange(["dairy"]));

    const names = result.current.rows
      .filter((row) => row.kind === "item")
      .map((row) => (row.kind === "item" ? row.item.description : ""));

    expect(names.sort()).toEqual(["Milk", "Mozzarella"]);
    expect(result.current.categoryIds).toEqual(["dairy"]);
  });

  it("SHOULD filter by location AND clear both with the filters", () => {
    const { result } = setupCatalog();

    act(() => result.current.onLocationsChange(["fridge"]));

    expect(
      result.current.rows.filter((row) => row.kind === "item"),
    ).toHaveLength(1);

    act(() => result.current.onClearFilters());

    expect(result.current.locationIds).toEqual([]);
    expect(
      result.current.rows.filter((row) => row.kind === "item"),
    ).toHaveLength(3);
  });

  it("SHOULD offer the options AND track which filter sheet is open", () => {
    const { result } = setupCatalog();

    expect(result.current.categoryOptions).toHaveLength(3);
    expect(result.current.locationOptions).toEqual(catalogData.locations);

    act(() => result.current.onOpenCategorySheet());
    expect(result.current.openFilter).toBe("category");

    act(() => result.current.onOpenLocationSheet());
    expect(result.current.openFilter).toBe("location");

    act(() => result.current.onCloseFilterSheet());
    expect(result.current.openFilter).toBeUndefined();
    expect(result.current.isCatalogLoading).toBe(false);
  });

  it("SHOULD open the categories and locations screen", () => {
    const { result } = setupCatalog();

    act(() => result.current.onCatalogPress());

    expect(modalNavigation.openModal).toHaveBeenCalledWith("stock_catalog");
  });
});

describe("expandCategoryIds", () => {
  it("SHOULD add every descendant at any depth AND keep unknown ids", () => {
    const categories = [
      { id: "a", label: "A" },
      { id: "b", label: "B", parentId: "a" },
      { id: "c", label: "C", parentId: "b" },
      { id: "d", label: "D" },
    ];

    expect([...expandCategoryIds(["a", "ghost"], categories)].sort()).toEqual([
      "a",
      "b",
      "c",
      "ghost",
    ]);
    expect([...expandCategoryIds([], categories)]).toEqual([]);
  });
});

describe("fetchCatalog", () => {
  function getCategories() {
    return jest.mocked(useCases.getStockCategoriesUseCase.execute);
  }
  function getLocations() {
    return jest.mocked(useCases.getStockLocationsUseCase.execute);
  }

  it("SHOULD read the active owners AND flatten the active categories with their path and the owner name WHEN there are several", async () => {
    getCategories().mockResolvedValue([
      {
        children: [
          {
            children: [],
            id: "c",
            itemCount: 0,
            name: "Cheese",
            parentId: "p",
            status: "ACTIVE",
          },
        ],
        id: "p",
        itemCount: 0,
        name: "Dairy",
        status: "ACTIVE",
      },
      { children: [], id: "x", itemCount: 0, name: "Old", status: "ARCHIVED" },
    ] as never);
    getLocations().mockResolvedValue([
      { id: "l", itemCount: 0, name: "Pantry", status: "ACTIVE" },
    ] as never);

    const result = await fetchCatalog([
      ...owners,
      new OwnerDTO({
        archived: true,
        id: "old",
        name: "Old",
        type: OwnerType.FAMILY,
      }),
    ]);

    expect(getCategories()).toHaveBeenCalledTimes(2);
    expect(getCategories()).toHaveBeenCalledWith({
      owner: "FAMILY",
      ownerId: "family-1",
    });
    expect(result.categories.slice(0, 2)).toEqual([
      { id: "p", label: "Dairy · Ana", parentId: undefined },
      { id: "c", label: "Dairy › Cheese · Ana", parentId: "p" },
    ]);
    expect(result.locations[0]).toEqual({ id: "l", label: "Pantry · Ana" });
  });

  it("SHOULD not add the owner name WHEN there is only one owner", async () => {
    getCategories().mockResolvedValue([]);
    getLocations().mockResolvedValue([
      { id: "l", itemCount: 0, name: "Pantry", status: "ACTIVE" },
    ] as never);

    expect((await fetchCatalog([owners[0]])).locations[0].label).toBe("Pantry");
  });
});

describe("location route (spec 117 FR 20)", () => {
  const location = {
    id: "loc-1",
    itemCount: 2,
    name: "Despensa",
    owner: "USER",
    ownerId: "user-id",
    status: StockCatalogStatus.ACTIVE,
  };

  function routeSetup(result: { data?: unknown; error?: unknown }) {
    spies.params.mockReturnValue({ id: "loc-1" });
    jest.mocked(useQuery).mockReturnValue({
      data: undefined,
      error: null,
      isFetching: false,
      refetch: jest.fn(),
      status: "success",
      ...result,
    } as never);

    return setup();
  }

  it("SHOULD filter by the location and use its name as the title", () => {
    const { result } = routeSetup({ data: location });

    expect(result.current.locationIds).toEqual(["loc-1"]);
    expect(result.current.locationRoute).toMatchObject({
      archived: false,
      name: "Despensa",
      notFound: false,
    });
  });

  it("SHOULD flag an archived location", () => {
    const { result } = routeSetup({
      data: { ...location, status: StockCatalogStatus.ARCHIVED },
    });

    expect(result.current.locationRoute?.archived).toBe(true);
  });

  it("SHOULD report not found on a 404 AND go back to the stock list", () => {
    const failure = new GenericError();

    failure.addContext({ error: new ApiBusinessError("Not Found", 404) });

    const { result } = routeSetup({ error: failure });

    expect(result.current.locationRoute?.notFound).toBe(true);

    act(() => result.current.onBackToStock());

    expect(router.replace).toHaveBeenCalledWith("/stock");
  });

  it("SHOULD NOT report not found on a connectivity failure", () => {
    const { result } = routeSetup({ error: new GenericError() });

    expect(result.current.locationRoute?.notFound).toBe(false);
  });

  it("SHOULD have no location route on the plain stock screen", () => {
    const { result } = setup();

    expect(result.current.locationRoute).toBeUndefined();
  });
});
