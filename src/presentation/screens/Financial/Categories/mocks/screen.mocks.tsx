import { render } from "@tests";

import FinancialCategories from "../";
import { useCategoriesViewModel } from "../hooks";
import CategoryRowUIModel from "../models/CategoryRowUIModel";
import { makeCategoryDTO } from "./index.mocks";

jest.mock("../hooks");
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
        {data?.length === 0 && ListEmptyComponent}
        {data?.map((item, index) => (
          <MockView key={index}>{renderItem({ item })}</MockView>
        ))}
      </MockView>
    ),
  };
});

const defaultViewModel: ReturnType<typeof useCategoriesViewModel> = {
  emptyTitleKey: "financial.categories.emptyExpense",
  errorMessage: undefined,
  isEmpty: false,
  isLoading: false,
  isRefreshing: false,
  onAddPress: jest.fn(),
  onOwnerFilterChange: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onRowPress: jest.fn(),
  onTypeChange: jest.fn(),
  ownerChoices: [{ labelKey: "financial.common.all", value: "ALL" }],
  ownerFilter: "ALL",
  rows: [],
  type: "EXPENSE",
  typeOptions: [
    { labelKey: "financial.common.expense", value: "EXPENSE" },
    { labelKey: "financial.common.income", value: "INCOME" },
  ],
};

function makeRows() {
  return [
    new CategoryRowUIModel({
      category: makeCategoryDTO({ id: "root", name: "Food" }),
      childCount: 2,
      depth: 0,
    }),
    new CategoryRowUIModel({
      category: makeCategoryDTO({ id: "leaf", name: "Snacks" }),
      childCount: 0,
      depth: 1,
    }),
  ];
}

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  jest
    .mocked(useCategoriesViewModel)
    .mockReturnValue({ ...defaultViewModel, ...overrides });

  return render(<FinancialCategories />);
}

export { defaultViewModel, makeRows, setup };
