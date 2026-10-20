import { render } from "@tests";

import FinancialTags from "../";
import { useTagsViewModel } from "../hooks";

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
      renderItem: (info: { index: number; item: unknown }) => React.ReactNode;
    }) => (
      <MockView testID="flashList" {...props}>
        {ListHeaderComponent}
        {data?.length === 0 && ListEmptyComponent}
        {data?.map((item, index) => (
          <MockView key={index}>{renderItem({ index, item })}</MockView>
        ))}
      </MockView>
    ),
  };
});

const defaultViewModel: ReturnType<typeof useTagsViewModel> = {
  errorMessage: undefined,
  isEmpty: false,
  isLoading: false,
  isRefreshing: false,
  onAddPress: jest.fn(),
  onOwnerFilterChange: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onRowPress: jest.fn(),
  onToastHide: jest.fn(),
  ownerChoices: [
    { labelKey: "financial.common.all", value: "ALL" },
    { label: "Test Family", value: "family-1" },
  ],
  ownerFilter: "ALL",
  readOnly: false,
  rows: [],
  toastVisible: false,
};

const rows = [
  {
    id: "t1",
    isAll: true,
    name: "gasto-fixo",
    ownerId: "user-id",
    usageCount: 24,
  },
  {
    id: "t2",
    isAll: false,
    name: "viagem",
    ownerId: "family-1",
    usageCount: 1,
  },
  {
    id: "t3",
    isAll: false,
    name: "sem-uso",
    ownerId: "family-1",
    usageCount: 0,
  },
];

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  jest.mocked(useTagsViewModel).mockReturnValue({
    ...defaultViewModel,
    ...overrides,
  });

  return render(<FinancialTags />);
}

export { defaultViewModel, rows, setup };
