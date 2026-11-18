import { StockExpirationStatus } from "@domain/entities/stock/StockEntity";
import StockListUIModel from "@screens/Stock/models/StockListUIModel";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import { fireEvent, mocks, screen, setup } from "./mocks/index.mocks";
import stockTestIds from "./testIds";

it("SHOULD render six skeleton rows and no list content WHEN loading", () => {
  setup({ isLoading: true, rows: [] });

  expect(screen.getByTestId(stockTestIds.skeleton)).toBeOnTheScreen();
  expect(screen.getByTestId(stockTestIds.skeleton).children).toHaveLength(6);
  expect(screen.queryByText("stock.list.group.ok")).toBeNull();
});

it("SHOULD show the error state and retry", () => {
  const vm = setup({
    errorMessageKey: "common.errors.generic",
    isLoading: false,
    rows: [],
  });

  expect(screen.getByText("common.errors.generic")).toBeOnTheScreen();

  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(vm.onRetry).toHaveBeenCalled();
});

it("SHOULD show the empty state and add from its action", () => {
  const vm = setup({ isEmpty: true, rows: [] });

  expect(screen.getByText("stock.list.emptyTitle")).toBeOnTheScreen();

  fireEvent.press(screen.getAllByText("stock.list.add")[0]);

  expect(vm.onAddPress).toHaveBeenCalled();
});

it("SHOULD show the no-results text and clear the filters", () => {
  const vm = setup({ hasNoResults: true, rows: [] });

  expect(screen.getByText("stock.list.noResults")).toBeOnTheScreen();
  expect(screen.getByTestId(stockTestIds.noResults)).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(stockTestIds.clearFilters));

  expect(vm.onClearFilters).toHaveBeenCalled();
});

describe("content", () => {
  it("SHOULD render the title and the attention subtitle", () => {
    setup();

    expect(screen.getByText("stock.list.title")).toBeOnTheScreen();
    expect(
      screen.getByText(
        'stock.list.subtitleAttention_other {"attention":1,"count":2}',
      ),
    ).toBeOnTheScreen();
  });

  it("SHOULD render the plain subtitle WHEN nothing needs attention", () => {
    setup({ subtitle: { attention: 0, total: 2 } });

    expect(
      screen.getByText('stock.list.subtitle_other {"count":2}'),
    ).toBeOnTheScreen();
  });

  it("SHOULD render the group headers, rows, badges and quantities", () => {
    setup();

    expect(screen.getByText("stock.list.group.attention")).toBeOnTheScreen();
    expect(screen.getByText("stock.list.group.ok")).toBeOnTheScreen();
    expect(screen.getByText("Leite")).toBeOnTheScreen();
    expect(screen.getByText("Arroz")).toBeOnTheScreen();
    expect(screen.getByText("stock.badge.expiring")).toBeOnTheScreen();
    expect(screen.getByText("stock.badge.restock")).toBeOnTheScreen();
    expect(screen.getByText("stock.badge.opened")).toBeOnTheScreen();
    expect(screen.getByText("5 common.units.kilogram")).toBeOnTheScreen();
    expect(
      screen.getAllByTestId(stockTestIds.row)[1].props.accessibilityLabel,
    ).toContain("stock.list.rowA11y");
  });

  it("SHOULD open the item WHEN a row is pressed", () => {
    const vm = setup();

    fireEvent.press(screen.getAllByTestId(stockTestIds.row)[0]);

    expect(vm.onItemPress).toHaveBeenCalledWith("stock-1");
  });
});

describe("toolbar", () => {
  it("SHOULD forward the search text", () => {
    const vm = setup();

    fireEvent.changeText(
      screen.getByPlaceholderText("stock.list.search"),
      "lei",
    );

    expect(vm.onSearchChange).toHaveBeenCalledWith("lei");
  });

  it("SHOULD forward a chip press", () => {
    const vm = setup();

    fireEvent.press(screen.getByTestId(`${stockTestIds.filter}-EXPIRING`));

    expect(vm.onFilterChange).toHaveBeenCalledWith("EXPIRING");
  });

  it("SHOULD add an item from the toolbar button", () => {
    const vm = setup();

    fireEvent.press(screen.getByTestId(stockTestIds.addButton));

    expect(vm.onAddPress).toHaveBeenCalled();
    expect(screen.queryByTestId("fab")).toBeNull();
  });

  it("SHOULD open the sort sheet", () => {
    const vm = setup();

    fireEvent.press(screen.getByLabelText("stock.list.sort.open"));

    expect(vm.onOpenSort).toHaveBeenCalled();
  });

  it("SHOULD list the sort options and choose one", () => {
    const vm = setup({ isSortOpen: true });

    expect(screen.getByText("stock.list.sort.name")).toBeOnTheScreen();
    expect(screen.getByText("stock.list.sort.recent")).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${stockTestIds.sortOption}-EXPIRATION-selected`),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByText("stock.list.sort.name"));

    expect(vm.onSortChange).toHaveBeenCalledWith("NAME");
  });
});

it("SHOULD give the list an estimated item size so the first paint has no hole", () => {
  setup();

  expect(screen.getByTestId("flashList").props.estimatedItemSize).toBe(64);
});

it("SHOULD wire pull-to-refresh on the list", () => {
  const vm = setup({ isRefreshing: true });
  const props = screen.getByTestId("flashList").props;

  expect(props.refreshing).toBe(true);
  expect(props.onRefresh).toBe(vm.onRefresh);
});

describe("catalog", () => {
  it("SHOULD open the categories and locations screen", () => {
    const vm = setup();

    fireEvent.press(screen.getByTestId(stockTestIds.catalogButton));

    expect(vm.onCatalogPress).toHaveBeenCalled();
  });

  it("SHOULD open each filter sheet from its button", () => {
    const vm = setup();

    fireEvent.press(screen.getByTestId(stockTestIds.categoryFilter));
    fireEvent.press(screen.getByTestId(stockTestIds.locationFilter));

    expect(vm.onOpenCategorySheet).toHaveBeenCalled();
    expect(vm.onOpenLocationSheet).toHaveBeenCalled();
  });

  it("SHOULD name the chosen categories and locations on the buttons", () => {
    setup({ categoryIds: ["c1"], locationIds: ["l1"] });

    expect(
      screen.getByText(
        'stock.list.filter.categoryValue {"names":"Dairy › Cheese"}',
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByText('stock.list.filter.locationValue {"names":"Fridge"}'),
    ).toBeOnTheScreen();
  });

  it("SHOULD offer the categories in the sheet and report the choice", () => {
    const vm = setup({ openFilter: "category" });

    fireEvent.press(
      screen.getByTestId(`${stockTestIds.filterSheetOptions}-c1`),
    );

    expect(vm.onCategoriesChange).toHaveBeenCalledWith(["c1"]);
  });

  it("SHOULD offer the locations in the sheet and report the choice", () => {
    const vm = setup({ openFilter: "location" });

    fireEvent.press(
      screen.getByTestId(`${stockTestIds.filterSheetOptions}-l1`),
    );

    expect(vm.onLocationsChange).toHaveBeenCalledWith(["l1"]);
  });

  it("SHOULD explain WHEN there is nothing to choose AND show a skeleton while loading", () => {
    setup({ categoryOptions: [], locationOptions: [], openFilter: "location" });
    expect(screen.getByText("stock.list.filter.noLocations")).toBeOnTheScreen();

    setup({ categoryOptions: [], openFilter: "category" });
    expect(
      screen.getAllByText("stock.list.filter.noCategories").length,
    ).toBeGreaterThan(0);

    setup({ isCatalogLoading: true, openFilter: "category" });
    expect(screen.queryByTestId(stockTestIds.filterSheetOptions)).toBeNull();
  });
});

describe("details", () => {
  it("SHOULD render the details only WHEN an item is selected", () => {
    setup();
    expect(screen.queryByTestId("stockItemDetails")).toBeNull();
  });

  it("SHOULD render the details WHEN an item is selected", () => {
    const item = mocks.view.rows.find((row) => row.kind === "item");
    setup({
      selectedItem: item && item.kind === "item" ? item.item : undefined,
    });

    expect(screen.getByTestId("stockItemDetails")).toBeOnTheScreen();
  });
});

describe("test ids", () => {
  it("SHOULD expose the screen and the empty state", () => {
    setup({ isEmpty: true, rows: [] });

    expect(screen.getByTestId(stockTestIds.screen)).toBeOnTheScreen();
    expect(screen.getByTestId(stockTestIds.emptyState)).toBeOnTheScreen();
  });

  it("SHOULD expose the rows, the expiring status and the quantity", () => {
    setup();

    expect(screen.getAllByTestId(stockTestIds.row)).toHaveLength(2);
    expect(screen.getByTestId(stockTestIds.statusExpiring)).toBeOnTheScreen();
    expect(screen.queryByTestId(stockTestIds.statusExpired)).toBeNull();
    expect(
      screen.getAllByTestId(stockTestIds.rowQuantity)[1],
    ).toHaveTextContent("5 common.units.kilogram");
    expect(screen.getByTestId(stockTestIds.statusRestock)).toBeOnTheScreen();
    expect(screen.getByTestId(stockTestIds.statusOpened)).toBeOnTheScreen();
  });

  it("SHOULD expose the expired status for an expired item", () => {
    const expired = new StockListUIModel(
      [
        dto((f) =>
          f
            .withId("stock-3")
            .withDescription("Iogurte")
            .withExpirationStatus(StockExpirationStatus.EXPIRED)
            .withNearestExpiration(new Date(2026, 9, 1)),
        ),
      ],
      mocks.owners,
      "en-US",
    );
    setup({
      rows: expired.view({ filter: "ALL", search: "", sort: "EXPIRATION" })
        .rows,
    });

    expect(screen.getByTestId(stockTestIds.statusExpired)).toBeOnTheScreen();
    expect(screen.queryByTestId(stockTestIds.statusExpiring)).toBeNull();
  });

  it("SHOULD show no date for a row without one and no restock", () => {
    setup();

    expect(
      screen.getAllByTestId(stockTestIds.row)[1].props.subtitle,
    ).toBeUndefined();
  });

  it("SHOULD expose the search input and the sort button", () => {
    setup();

    expect(screen.getByTestId(stockTestIds.search)).toBeOnTheScreen();
    expect(screen.getByTestId(stockTestIds.sortButton)).toBeOnTheScreen();
  });
});

it("SHOULD show the read-only banner AND toast, without the add button, WHEN an archived family is selected", () => {
  setup({ readOnly: true, toastVisible: true });

  expect(screen.getByTestId(stockTestIds.readOnlyBanner)).toBeTruthy();
  expect(screen.getByTestId(stockTestIds.readOnlyToast)).toBeTruthy();
  expect(screen.queryByTestId(stockTestIds.addButton)).toBeNull();
});

describe("location route (spec 117 FR 20)", () => {
  it("SHOULD show 'Local não encontrado' with a way back WHEN the location is missing", () => {
    const vm = setup({
      locationRoute: { archived: false, isLoading: false, notFound: true },
      rows: [],
    });

    expect(screen.getByTestId("stock.location.not-found")).toBeTruthy();

    fireEvent.press(screen.getByText("stock.location.backToStock"));

    expect(vm.onBackToStock).toHaveBeenCalled();
  });

  it("SHOULD use the location name as the title AND warn WHEN it is archived", () => {
    setup({
      locationRoute: {
        archived: true,
        isLoading: false,
        name: "Despensa",
        notFound: false,
      },
    });

    expect(screen.getByText("Despensa")).toBeTruthy();
    expect(screen.getByTestId("stock.location.archived-banner")).toBeTruthy();
  });
});
