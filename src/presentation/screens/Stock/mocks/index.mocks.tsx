import "@shopify/flash-list/jestSetup";
import { View } from "react-native";

import { render } from "@tests";

import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import StockListUIModel from "@screens/Stock/models/StockListUIModel";

import Stock from "../";
import { useStockViewModel } from "../hooks";

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
const DAY_MS = 24 * 60 * 60 * 1000;
const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
];
const dtos = [
  new StockDTO({
    description: "Leite",
    expirationDate: new Date(Date.now() + 2 * DAY_MS),
    id: "stock-1",
    owner: StockOwners.USER,
    ownerId: "user-id",
    quantity: 2,
    unit: StockUnits.LITER,
  }),
  new StockDTO({
    description: "Arroz",
    id: "stock-2",
    owner: StockOwners.USER,
    ownerId: "user-id",
    quantity: 5,
    unit: StockUnits.KILOGRAM,
  }),
];
const list = new StockListUIModel(dtos, owners, new Date(), "en-US");
const view = list.view({ filter: "ALL", search: "", sort: "EXPIRATION" });
// endregion mocks

function givenViewModel(overrides: Record<string, unknown> = {}) {
  const vm = {
    activeFilter: view.activeFilter,
    errorMessageKey: undefined,
    filterOptions: view.filterOptions,
    hasNoResults: false,
    isEmpty: false,
    isLoading: false,
    isRefreshing: false,
    isSortOpen: false,
    onAddPress: jest.fn(),
    onClearFilters: jest.fn(),
    onCloseDetails: jest.fn(),
    onCloseSort: jest.fn(),
    onFilterChange: jest.fn(),
    onItemDeleted: jest.fn(),
    onItemPress: jest.fn(),
    onOpenSort: jest.fn(),
    onRefresh: jest.fn(),
    onRetry: jest.fn(),
    onSearchChange: jest.fn(),
    onSortChange: jest.fn(),
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

const mocks = { list, view, View };

export { mocks, setup };
export { fireEvent, screen } from "@tests";
