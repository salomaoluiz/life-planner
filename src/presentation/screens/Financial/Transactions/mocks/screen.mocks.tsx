import { render } from "@tests";

import FinancialTransactions from "../";
import {
  FinancialHeaderActionsProvider,
  useFinancialHeaderActionsNode,
} from "../../Layout/headerActions";
import { useTransactionsViewModel } from "../hooks";
import useAdjustmentSheet from "../hooks/useAdjustmentSheet";
import usePayTransaction from "../hooks/usePayTransaction";
import { EMPTY_FILTERS } from "../models/transactionFilters";
import { ListEntry } from "../models/transactionList";
import TransactionUIModel from "../models/TransactionUIModel";
import { categories, makeTransactionDTO } from "./index.mocks";

jest.mock("../hooks");
jest.mock("../hooks/useAdjustmentSheet");
jest.mock("../hooks/usePayTransaction");
jest.mock("../hooks/useFilterOptions", () => ({
  __esModule: true,
  default: () => ({ categories: [], categoryDtos: [], sources: [], tags: [] }),
}));
// The export modal runs its own queries (spec 047); its own tests cover it.
jest.mock("../modals/ExportModal", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: () => <MockView testID={"financial.export.sheet"} />,
  };
});
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
  allOwnerIds: ["user-id"],
  archivedOwnerIds: new Set<string>(),
  balances: new Map(),
  entries: [],
  errorMessage: undefined,
  expandedDayKey: undefined,
  expandedInvoiceId: undefined,
  filterCount: 0,
  filteredSummary: undefined,
  filtering: false,
  filters: EMPTY_FILTERS,
  filtersEmpty: false,
  filtersError: undefined,
  filtersLoading: false,
  hasPeriod: false,
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
  onDayToggle: jest.fn(),
  onFilterRemove: jest.fn(),
  onFiltersApply: jest.fn(),
  onFiltersClear: jest.fn(),
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
  onProjectedPress: jest.fn(),
  onReadOnlyAttempt: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onRowPress: jest.fn(),
  onSearchChange: jest.fn(),
  onSummaryRetry: jest.fn(),
  onToastHide: jest.fn(),
  onTypeFilterChange: jest.fn(),
  ownerFilter: "ALL",
  owners: [],
  personalOwnerId: "user-id",
  pickerYear: 2026,
  readOnly: false,
  scopeChoices: [],
  scopeOwnerIds: ["user-id"],
  selectedMonthIndex: undefined,
  stickyIndices: [],
  summary: {
    balanceCents: 1000,
    expenseCents: 2000,
    incomeCents: 3000,
    projectedExpenseCents: 0,
    projectedIncomeCents: 0,
    toPayCents: 500,
    toReceiveCents: 800,
  },
  summaryError: false,
  toastVisible: false,
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

// What the Finances layout does with the header slot (spec 050).
function HeaderSlot() {
  return <>{useFinancialHeaderActionsNode()}</>;
}

function makeEntries(): ListEntry[] {
  const day = new Date(2026, 9, 5);

  return [
    {
      dateKey: "2026-10-05",
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

  return render(
    <FinancialHeaderActionsProvider>
      <HeaderSlot />
      <FinancialTransactions />
    </FinancialHeaderActionsProvider>,
  );
}

export {
  defaultAdjustmentSheet,
  defaultPay,
  defaultViewModel,
  makeEntries,
  setup,
};
