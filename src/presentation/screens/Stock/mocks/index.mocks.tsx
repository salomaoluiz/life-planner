import "@shopify/flash-list/jestSetup";
import { View } from "react-native";

import { render } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  StockExpirationStatus,
  StockUnits,
} from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import StockListUIModel from "@screens/Stock/models/StockListUIModel";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import Stock from "../";
import { useStockViewModel } from "../hooks";
import { quickMock } from "./quick.mocks";

jest.mock("../hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
jest.mock("@shopify/flash-list", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    FlashList: ({
      data,
      ListEmptyComponent,
      ListHeaderComponent,
      renderItem,
      ...props
    }: {
      data?: unknown[];
      ListEmptyComponent?: React.ReactNode;
      ListHeaderComponent?: React.ReactNode;
      renderItem: (info: { item: unknown }) => React.ReactNode;
    }) => (
      <MockView testID="flashList" {...props}>
        {ListHeaderComponent}
        {data?.length
          ? data.map((item, index) => (
              <MockView key={index}>{renderItem({ item })}</MockView>
            ))
          : ListEmptyComponent}
      </MockView>
    ),
  };
});
jest.mock("@screens/Stock/containers/StockItemDetails", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: () => <MockView testID="stockItemDetails" />,
  };
});

// region mocks
const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
];
const dtos = [
  dto((f) =>
    f
      .withId("stock-1")
      .withDescription("Leite")
      .withUnit(StockUnits.LITER)
      .withQuantity(2)
      .withExpirationStatus(StockExpirationStatus.EXPIRING)
      .withNearestExpiration(new Date(2026, 9, 8))
      .withHasOpenLot()
      .withNeedsRestock(),
  ),
  dto((f) =>
    f
      .withId("stock-2")
      .withDescription("Arroz")
      .withUnit(StockUnits.KILOGRAM)
      .withQuantity(5),
  ),
];
const list = new StockListUIModel(dtos, owners, "en-US");
const view = list.view({ filter: "ALL", search: "", sort: "EXPIRATION" });
// endregion mocks

function givenViewModel(overrides: Record<string, unknown> = {}) {
  const vm = {
    activeFilter: view.activeFilter,
    categoryIds: [],
    categoryOptions: [{ id: "c1", label: "Dairy › Cheese" }],
    errorMessageKey: undefined,
    filterOptions: view.filterOptions,
    hasNoResults: false,
    isCatalogLoading: false,
    isEmpty: false,
    isLoading: false,
    isRefreshing: false,
    isSortOpen: false,
    locationIds: [],
    locationOptions: [{ id: "l1", label: "Fridge" }],
    onAddPress: jest.fn(),
    onBackToStock: jest.fn(),
    onCatalogPress: jest.fn(),
    onCategoriesChange: jest.fn(),
    onClearFilters: jest.fn(),
    onCloseDetails: jest.fn(),
    onCloseFilterSheet: jest.fn(),
    onCloseSort: jest.fn(),
    onFilterChange: jest.fn(),
    onItemDeleted: jest.fn(),
    onItemPress: jest.fn(),
    onLocationsChange: jest.fn(),
    onOpenCategorySheet: jest.fn(),
    onOpenLocationSheet: jest.fn(),
    onOpenSort: jest.fn(),
    onRefresh: jest.fn(),
    onRetry: jest.fn(),
    onSearchChange: jest.fn(),
    onSortChange: jest.fn(),
    onToastHide: jest.fn(),
    openFilter: undefined,
    quick: quickMock(),
    readOnly: false,
    rows: view.rows,
    search: "",
    selectedItem: undefined,
    sort: "EXPIRATION",
    sortOptions: [
      { labelKey: "stock.list.sort.expiration", value: "EXPIRATION" },
      { labelKey: "stock.list.sort.name", value: "NAME" },
      { labelKey: "stock.list.sort.recent", value: "RECENT" },
    ],
    subtitle: { attention: list.attentionCount, total: list.total },
    toastVisible: false,
    ...overrides,
  };
  jest.mocked(useStockViewModel).mockReturnValue(vm as never);

  return vm;
}

function setup(overrides: Record<string, unknown> = {}) {
  const vm = givenViewModel(overrides);

  render(<Stock />);

  return vm;
}

const mocks = { list, owners, view, View };

export { mocks, quickMock, setup };
export { fireEvent, screen } from "@tests";
