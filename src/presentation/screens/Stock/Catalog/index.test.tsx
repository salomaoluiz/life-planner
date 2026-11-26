import { fireEvent, hasText, render, screen } from "@tests";

import StockCatalog from "./";
import useStockCatalogScreenViewModel from "./hooks/useStockCatalogScreenViewModel";
import { buildCatalogEntries, CatalogNode } from "./models/catalogEntries";
import stockCatalogTestIds from "./testIds";

jest.mock("./hooks/useStockCatalogScreenViewModel");
jest.mock("@shopify/flash-list", () => {
  const { View: MockView } = jest.requireActual("react-native");

  return {
    FlashList: ({
      data,
      ListEmptyComponent,
      ListFooterComponent,
      ListHeaderComponent,
      renderItem,
    }: {
      data?: unknown[];
      ListEmptyComponent?: React.ReactNode;
      ListFooterComponent?: React.ReactNode;
      ListHeaderComponent?: React.ReactNode;
      renderItem: (info: { index: number; item: unknown }) => React.ReactNode;
    }) => (
      <MockView testID="flashList">
        {ListHeaderComponent}
        {data?.length === 0 && ListEmptyComponent}
        {data?.map((item, index) => (
          <MockView key={index}>{renderItem({ index, item })}</MockView>
        ))}
        {ListFooterComponent}
      </MockView>
    ),
  };
});
jest.mock("./components/CatalogForm", () => ({
  __esModule: true,
  default: (props: { kind: string }) => {
    const { Text } = jest.requireActual("react-native");

    return <Text testID="form-stub">{`form:${props.kind}`}</Text>;
  },
}));
jest.mock("./components/CatalogDelete", () => ({
  __esModule: true,
  default: () => {
    const { Text } = jest.requireActual("react-native");

    return <Text testID="delete-stub">delete</Text>;
  },
}));
jest.mock("./components/LocationQrPrintSheet", () => ({
  __esModule: true,
  default: () => {
    const { Text } = jest.requireActual("react-native");

    return <Text testID="print-stub">print</Text>;
  },
}));
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

function node(
  id: string,
  name: string,
  extra: Partial<CatalogNode> = {},
): CatalogNode {
  return {
    children: [],
    color: "#F59E0B",
    icon: "cart",
    itemCount: 3,
    name,
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
    ...extra,
    id,
  };
}

const tree = [
  node("dairy", "Dairy", {
    children: [node("cheese", "Cheese", { parentId: "dairy" })],
    financeCategoryId: "fin",
  }),
  node("old", "Old", { status: "ARCHIVED" }),
];

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    archivedExpanded: false,
    data: { categories: tree, locations: [], owners: [] },
    deleting: undefined,
    editor: undefined,
    emptyOwners: [],
    entries: buildCatalogEntries(tree, false),
    errorMessage: undefined,
    financeLabels: new Map([["fin", "Alimentação › Mercado"]]),
    isBusy: false,
    isLoading: false,
    isRefreshing: false,
    onAddChild: jest.fn(),
    onAddPress: jest.fn(),
    onArchivedToggle: jest.fn(),
    onCreateSuggestions: jest.fn(),
    onDeleteClose: jest.fn(),
    onDeleted: jest.fn(),
    onDeleteRequest: jest.fn(),
    onEditorClose: jest.fn(),
    onFromScratch: jest.fn(),
    onOwnerFilterChange: jest.fn(),
    onPrintClose: jest.fn(),
    onPrintOpen: jest.fn(),
    onRefresh: jest.fn(),
    onRetry: jest.fn(),
    onRowPress: jest.fn(),
    onSaved: jest.fn(),
    onTabChange: jest.fn(),
    onToastHide: jest.fn(),
    onToggleSuggestion: jest.fn(),
    onViewItems: jest.fn(),
    ownerChoices: [
      { labelKey: "financial.common.all", value: "ALL" },
      { label: "Ana", value: "user-id" },
    ],
    ownerFilter: "ALL",
    printLocations: [],
    printOpen: false,
    readOnly: false,
    tab: "categories",
    toastVisible: false,
    unchecked: {},
    ...overrides,
  };

  jest.mocked(useStockCatalogScreenViewModel).mockReturnValue(vm as never);
  render(<StockCatalog />);

  return vm;
}

it("SHOULD render skeletons WHEN loading", () => {
  setup({ isLoading: true });

  expect(screen.getAllByTestId("stock-catalog-skeleton")).toHaveLength(6);
});

it("SHOULD render the error with a retry", () => {
  const vm = setup({ errorMessage: "boom" });

  expect(hasText("boom")).toBe(true);
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(vm.onRetry).toHaveBeenCalled();
});

it("SHOULD show tabs, the rows with sub count, items and finance caption, and open a row on press", () => {
  const vm = setup();

  expect(screen.getByTestId(stockCatalogTestIds.tabs)).toBeOnTheScreen();
  expect(
    hasText(
      'stock.catalog.subcategories_one {"count":1} · stock.catalog.financeCaption {"name":"Alimentação › Mercado"}',
    ),
  ).toBe(true);
  expect(
    screen.getAllByText('stock.catalog.itemCount_other {"count":3}').length,
  ).toBeGreaterThan(0);
  expect(screen.getByText("Dairy")).toBeOnTheScreen();
  expect(screen.getByText("Cheese")).toBeOnTheScreen();

  fireEvent.press(screen.getByText("Cheese"));
  expect(vm.onRowPress).toHaveBeenCalledWith("cheese");
});

it("SHOW the owner badge only for All", () => {
  setup();
  expect(
    screen.getAllByTestId(stockCatalogTestIds.ownerBadge).length,
  ).toBeGreaterThan(0);
});

it("SHOULD hide the owner badge WHEN one owner is selected", () => {
  setup({ ownerFilter: "user-id" });

  expect(screen.queryByTestId(stockCatalogTestIds.ownerBadge)).toBeNull();
});

it("SHOULD show the archived group and toggle it", () => {
  const vm = setup();

  expect(hasText('stock.catalog.archivedCategories {"count":1}')).toBe(true);
  fireEvent.press(screen.getByTestId(stockCatalogTestIds.archivedToggle));
  expect(vm.onArchivedToggle).toHaveBeenCalled();
});

it("SHOULD add from the plus button AND change the tab and the owner", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(stockCatalogTestIds.addButton));
  expect(vm.onAddPress).toHaveBeenCalled();
  fireEvent.press(screen.getByText("stock.catalog.tabs.locations"));
  expect(vm.onTabChange).toHaveBeenCalledWith("locations");
});

it("SHOULD offer Print QR codes only on the locations tab", () => {
  const first = setup();

  expect(screen.queryByTestId(stockCatalogTestIds.printButton)).toBeNull();

  jest
    .mocked(useStockCatalogScreenViewModel)
    .mockReturnValue({ ...first, tab: "locations" } as never);
  render(<StockCatalog />);

  fireEvent.press(screen.getByTestId(stockCatalogTestIds.printButton));
  expect(first.onPrintOpen).toHaveBeenCalled();
});

it("SHOULD hide the plus and show the read only banner WHEN the scope is read only", () => {
  setup({ readOnly: true });

  expect(screen.queryByTestId(stockCatalogTestIds.addButton)).toBeNull();
  expect(
    screen.getByTestId(stockCatalogTestIds.readOnlyBanner),
  ).toBeOnTheScreen();
});

it("SHOULD show one suggestions block per empty owner AND create the checked ones", () => {
  const vm = setup({
    emptyOwners: [
      { id: "user-id", isPersonal: true, kind: "USER", name: "Ana" },
    ],
    entries: [],
    unchecked: { "user-id": ["DAIRY"] },
  });

  expect(hasText('stock.catalog.empty.categories {"owner":"Ana"}')).toBe(true);

  fireEvent.press(screen.getByTestId(stockCatalogTestIds.createSuggestions));
  expect(vm.onCreateSuggestions).toHaveBeenCalledWith(
    "user-id",
    "USER",
    expect.not.arrayContaining(["DAIRY"]),
  );

  fireEvent.press(screen.getByTestId(stockCatalogTestIds.fromScratch));
  expect(vm.onFromScratch).toHaveBeenCalledWith("user-id");

  fireEvent.press(screen.getByTestId(`${stockCatalogTestIds.suggestion}.MEAT`));
  expect(vm.onToggleSuggestion).toHaveBeenCalledWith("user-id", "MEAT");
});

it("SHOULD render the form, the delete sheet and the print sheet WHEN asked", () => {
  const vm = setup({
    deleting: { id: "dairy", kind: "category" },
    editor: { kind: "category", ownerId: "user-id", ownerKind: "USER" },
    printOpen: true,
  });

  expect(screen.getByText("form:category")).toBeOnTheScreen();
  expect(screen.getByTestId("delete-stub")).toBeOnTheScreen();
  expect(screen.getByTestId("print-stub")).toBeOnTheScreen();
  expect(vm.onRefresh).not.toHaveBeenCalled();
});
