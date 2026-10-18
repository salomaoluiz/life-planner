import { render } from "@tests";

import FinancialTransactions from "../";
import { useTransactionsViewModel } from "../hooks";
import useAdjustmentSheet from "../hooks/useAdjustmentSheet";
import usePayTransaction from "../hooks/usePayTransaction";
import { ListEntry } from "../models/transactionList";
import TransactionUIModel from "../models/TransactionUIModel";
import { categories, makeTransactionDTO } from "./index.mocks";

jest.mock("../hooks");
jest.mock("../hooks/useAdjustmentSheet");
jest.mock("../hooks/usePayTransaction");
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
  expandedInvoiceId: undefined,
  invoicesError: false,
  isEmptyMonth: false,
  isFilteredEmpty: false,
  isLoading: false,
  isMonthPickerOpen: false,
  isRefreshing: false,
  languageTag: "en-US",
  monthChoices: [{ label: "January", value: "0" }],
  monthLabel: "October 2026",
  monthName: "October",
  onAddPress: jest.fn(),
  onClearFilters: jest.fn(),
  onInvoiceOpen: jest.fn(),
  onInvoiceRetry: jest.fn(),
  onInvoiceToggle: jest.fn(),
  onMonthPickerClose: jest.fn(),
  onMonthPickerOpen: jest.fn(),
  onMonthSelect: jest.fn(),
  onNextMonth: jest.fn(),
  onOwnerFilterChange: jest.fn(),
  onPickerYearChange: jest.fn(),
  onPreviousMonth: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onRowPress: jest.fn(),
  onSummaryRetry: jest.fn(),
  onTypeFilterChange: jest.fn(),
  ownerFilter: "ALL",
  personalOwnerId: "user-id",
  pickerYear: 2026,
  scopeChoices: [],
  selectedMonthIndex: undefined,
  stickyIndices: [],
  summary: {
    balanceCents: 1000,
    expenseCents: 2000,
    incomeCents: 3000,
    toPayCents: 500,
    toReceiveCents: 800,
  },
  summaryError: false,
  typeFilter: "ALL",
};

const defaultAdjustmentSheet: ReturnType<typeof useAdjustmentSheet> = {
  errorKey: undefined,
  isDeleting: false,
  item: undefined,
  onClose: jest.fn(),
  onDelete: jest.fn(),
  onOpen: jest.fn(),
};

const defaultPay: ReturnType<typeof usePayTransaction> = {
  hasError: false,
  onPay: jest.fn(),
  payingId: undefined,
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

function setup(
  overrides: Partial<typeof defaultViewModel> = {},
  adjustmentOverrides: Partial<typeof defaultAdjustmentSheet> = {},
  payOverrides: Partial<typeof defaultPay> = {},
) {
  jest
    .mocked(useTransactionsViewModel)
    .mockReturnValue({ ...defaultViewModel, ...overrides });
  jest
    .mocked(useAdjustmentSheet)
    .mockReturnValue({ ...defaultAdjustmentSheet, ...adjustmentOverrides });
  jest
    .mocked(usePayTransaction)
    .mockReturnValue({ ...defaultPay, ...payOverrides });

  return render(<FinancialTransactions />);
}

export {
  defaultAdjustmentSheet,
  defaultPay,
  defaultViewModel,
  makeEntries,
  setup,
};
