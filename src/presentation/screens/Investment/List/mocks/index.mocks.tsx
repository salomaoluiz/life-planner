import { render } from "@tests";

import { InvestmentAssetStatus } from "@domain/entities/investment/enums";
import { makeAsset, owners } from "@screens/Investment/mocks/fixtures";
import {
  buildEntries,
  filterAssets,
} from "@screens/Investment/models/assetList";

import InvestmentList from "../";
import { InvestmentListVM, useInvestmentListViewModel } from "../hooks";

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
      ListFooterComponent,
      ListHeaderComponent,
      renderItem,
      ...props
    }: {
      data?: unknown[];
      ListEmptyComponent?: React.ReactNode;
      ListFooterComponent?: React.ReactNode;
      ListHeaderComponent?: React.ReactNode;
      renderItem: (info: { item: unknown }) => React.ReactNode;
    }) => (
      <MockView testID="flashList" {...props}>
        {ListHeaderComponent}
        {data?.length === 0 && ListEmptyComponent}
        {data?.map((item, index) => (
          <MockView key={index}>{renderItem({ item })}</MockView>
        ))}
        {ListFooterComponent}
      </MockView>
    ),
  };
});

const entries = buildEntries(
  filterAssets(
    [
      makeAsset(),
      makeAsset({
        id: "asset-2",
        position: {
          ...makeAsset().position,
          currentUnitPrice: null,
          currentValue: null,
          currentValueDate: null,
          openResult: null,
          openResultPercent: null,
        },
        ticker: "WEGE3",
      }),
    ],
    owners,
    "ALL",
    "",
  ),
);

const defaultViewModel: InvestmentListVM = {
  archivedCount: 0,
  assetsCount: 2,
  entries,
  errorMessage: undefined,
  hasAny: true,
  hasQuotes: false,
  isEmpty: false,
  isLoading: false,
  isRefreshing: false,
  noResults: false,
  onAddPress: jest.fn(),
  onConfirmMaturity: jest.fn(),
  onOwnerFilterChange: jest.fn(),
  onQuotesRefresh: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onRowPress: jest.fn(),
  onSearchChange: jest.fn(),
  onTabChange: jest.fn(),
  onToastHide: jest.fn(),
  ownerChoices: [{ labelKey: "financial.common.all", value: "ALL" }],
  ownerFilter: "ALL",
  pendingAssets: [],
  quotesDisabled: false,
  quotesRefreshing: false,
  quotesSecondsLeft: 0,
  quotesSourceDown: false,
  quotesTime: null,
  readOnly: false,
  search: "",
  tab: InvestmentAssetStatus.ACTIVE,
  toastVisible: false,
};

function setup(overrides: Partial<InvestmentListVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useInvestmentListViewModel).mockReturnValue(vm);

  return { vm, ...render(<InvestmentList />) };
}

export { defaultViewModel, setup };
