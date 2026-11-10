import { render } from "@tests";

import { InvestmentPriceRange } from "@domain/entities/investment/enums";
import { makeDetail } from "@screens/Investment/mocks/fixtures";

import InvestmentDetail from "../";
import { InvestmentDetailVM, useInvestmentDetailViewModel } from "../hooks";

jest.mock("../hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const defaultViewModel: InvestmentDetailVM = {
  accountNames: new Map([["acc-1", "Broker"]]),
  archived: false,
  archivedAt: null,
  asset: makeDetail(),
  chartMode: "price",
  deleteSummary: { entries: 2, operations: 2 },
  errorMessage: undefined,
  history: undefined,
  historyLoading: false,
  isDeleteOpen: false,
  isDeleting: false,
  isLoading: false,
  isMenuOpen: false,
  isNotFound: false,
  isRefreshing: false,
  manualOverQuote: false,
  onAddOperation: jest.fn(),
  onArchiveToggle: jest.fn(),
  onBack: jest.fn(),
  onBackToAutomatic: jest.fn(),
  onChartModeChange: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeleteOpen: jest.fn(),
  onDeleteValuation: jest.fn(),
  onEdit: jest.fn(),
  onMenuClose: jest.fn(),
  onMenuOpen: jest.fn(),
  onOperationPress: jest.fn(),
  onQuotesRefresh: jest.fn(),
  onRangeChange: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onToastHide: jest.fn(),
  onUpdateValue: jest.fn(),
  ownerLabel: "",
  quotesDisabled: false,
  quotesRefreshing: false,
  quotesSecondsLeft: 0,
  quotesSourceDown: false,
  range: InvestmentPriceRange.ONE_YEAR,
  readOnly: false,
  sellCount: 1,
  toastVisible: false,
};

function setup(overrides: Partial<InvestmentDetailVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useInvestmentDetailViewModel).mockReturnValue(vm);

  return { vm, ...render(<InvestmentDetail />) };
}

export { defaultViewModel, setup };
