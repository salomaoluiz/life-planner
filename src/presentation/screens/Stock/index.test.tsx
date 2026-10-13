import { fireEvent, mocks, screen, setup } from "./mocks/index.mocks";

it("SHOULD render six skeleton rows and no list content WHEN loading", () => {
  setup({ isLoading: true, rows: [] });

  expect(screen.getByTestId("stock-skeleton")).toBeOnTheScreen();
  expect(screen.getByTestId("stock-skeleton").children).toHaveLength(6);
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

  fireEvent.press(screen.getByText("stock.list.clearFilters"));

  expect(vm.onClearFilters).toHaveBeenCalled();
});

describe("content", () => {
  it("SHOULD render the title and the attention subtitle", () => {
    setup();

    expect(screen.getByText("stock.list.title")).toBeOnTheScreen();
    expect(
      screen.getByText(
        'stock.list.subtitleAttention {"attention":1,"total":2}',
      ),
    ).toBeOnTheScreen();
  });

  it("SHOULD render the plain subtitle WHEN nothing needs attention", () => {
    setup({ subtitle: { attention: 0, total: 2 } });

    expect(
      screen.getByText('stock.list.subtitle {"total":2}'),
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
      screen.getByTestId("stock-row-stock-2").props.accessibilityLabel,
    ).toContain("stock.list.rowA11y");
  });

  it("SHOULD open the item WHEN a row is pressed", () => {
    const vm = setup();

    fireEvent.press(screen.getByTestId("stock-row-stock-1"));

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

    fireEvent.press(screen.getByTestId("stock-filter-EXPIRING"));

    expect(vm.onFilterChange).toHaveBeenCalledWith("EXPIRING");
  });

  it("SHOULD add an item from the toolbar button", () => {
    const vm = setup();

    fireEvent.press(screen.getByTestId("stock-add"));

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
      screen.getByTestId("stock-sort-EXPIRATION-selected"),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByText("stock.list.sort.name"));

    expect(vm.onSortChange).toHaveBeenCalledWith("NAME");
  });
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
