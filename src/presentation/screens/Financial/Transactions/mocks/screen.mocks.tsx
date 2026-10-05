import { render } from "@tests";

import FinancialTransactions from "../";
import { useTransactionsViewModel } from "../hooks";
import { ListEntry } from "../models/transactionList";
import TransactionUIModel from "../models/TransactionUIModel";
import { categories, makeTransactionDTO } from "./index.mocks";

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

const defaultViewModel: ReturnType<typeof useTransactionsViewModel> = {
  entries: [],
  errorMessage: undefined,
  filter: "ALL",
  filterChoices: [],
  isEmptyMonth: false,
  isFilteredEmpty: false,
  isLoading: false,
  isMonthPickerOpen: false,
  isRefreshing: false,
  languageTag: "en-US",
  monthChoices: [{ label: "January", value: "0" }],
  monthLabel: "October 2026",
  onAddPress: jest.fn(),
  onClearFilters: jest.fn(),
  onFilterChange: jest.fn(),
  onMonthPickerClose: jest.fn(),
  onMonthPickerOpen: jest.fn(),
  onMonthSelect: jest.fn(),
  onNextMonth: jest.fn(),
  onPickerYearChange: jest.fn(),
  onPreviousMonth: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onRowPress: jest.fn(),
  onSummaryRetry: jest.fn(),
  pickerYear: 2026,
  selectedMonthIndex: undefined,
  stickyIndices: [],
  summary: { balanceCents: 1000, expenseCents: 2000, incomeCents: 3000 },
  summaryError: false,
};

function makeEntries(): ListEntry[] {
  const day = new Date(2026, 9, 5);

  return [
    {
      day,
      key: "header-2026-10-05",
      kind: "header",
      label: { kind: "today" },
      netCents: -1250,
    },
    {
      item: new TransactionUIModel(
        makeTransactionDTO({ id: "tx-1" }),
        categories[0],
      ),
      key: "item-tx-1",
      kind: "item",
    },
    {
      item: new TransactionUIModel(
        makeTransactionDTO({ id: "tx-2" }),
        categories[0],
      ),
      key: "item-tx-2",
      kind: "item",
    },
  ];
}

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  jest
    .mocked(useTransactionsViewModel)
    .mockReturnValue({ ...defaultViewModel, ...overrides });

  return render(<FinancialTransactions />);
}

export { defaultViewModel, makeEntries, setup };
