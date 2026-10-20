import StockDTO from "@application/dto/stock/StockDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import StockListUIModel from "@screens/Stock/models/StockListUIModel";

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
    expect(screen.getByText('stock.status.days {"count":2}')).toBeOnTheScreen();
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
    expect(screen.getByTestId(stockTestIds.rowQuantity)).toHaveTextContent(
      "5 common.units.kilogram",
    );
  });

  it("SHOULD expose the expired status for an expired item", () => {
    const expired = new StockListUIModel(
      [
        new StockDTO({
          description: "Iogurte",
          expirationDate: new Date(Date.now() - 3 * mocks.DAY_MS),
          id: "stock-3",
          owner: StockOwners.USER,
          ownerId: "user-id",
          quantity: 1,
          unit: StockUnits.UNIT,
        }),
      ],
      mocks.owners,
      new Date(),
      "en-US",
    );
    setup({
      rows: expired.view({ filter: "ALL", search: "", sort: "EXPIRATION" })
        .rows,
    });

    expect(screen.getByTestId(stockTestIds.statusExpired)).toBeOnTheScreen();
    expect(screen.queryByTestId(stockTestIds.statusExpiring)).toBeNull();
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
