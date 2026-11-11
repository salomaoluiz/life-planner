import { render } from "@tests";

import { InvestmentPriceRange } from "@domain/entities/investment/enums";
import { InvestmentEventSuggestion } from "@domain/entities/investment/InvestmentEntities";
import useEventSuggestionActions from "@screens/Investment/Events/hooks/useEventSuggestionActions";
import useEventSuggestions from "@screens/Investment/Events/hooks/useEventSuggestions";
import { makeDetail } from "@screens/Investment/mocks/fixtures";

import InvestmentDetail from "../";
import {
  IncomeSectionVM,
  InvestmentDetailVM,
  useIncomeSectionViewModel,
  useInvestmentDetailViewModel,
} from "../hooks";

jest.mock("../hooks");
jest.mock("@screens/Investment/Events/hooks/useEventSuggestions");
jest.mock("@screens/Investment/Events/hooks/useEventSuggestionActions");
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
  fixedIncome: null,
  fixedIncomeMenuOpen: false,
  fixedIncomeTab: "lots",
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
  onAdjust: jest.fn(),
  onArchiveToggle: jest.fn(),
  onBack: jest.fn(),
  onBackToAutomatic: jest.fn(),
  onChartModeChange: jest.fn(),
  onConfirmMaturity: jest.fn(),
  onContribute: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeleteOpen: jest.fn(),
  onDeleteValuation: jest.fn(),
  onEdit: jest.fn(),
  onFixedIncomeMenuClose: jest.fn(),
  onFixedIncomeMore: jest.fn(),
  onFixedIncomeOperationDelete: jest.fn(),
  onFixedIncomeTabChange: jest.fn(),
  onMenuClose: jest.fn(),
  onMenuOpen: jest.fn(),
  onOperationPress: jest.fn(),
  onQuotesRefresh: jest.fn(),
  onRangeChange: jest.fn(),
  onRateDelete: jest.fn(),
  onRateEdit: jest.fn(),
  onRedeem: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onSellFraction: jest.fn(),
  onToastHide: jest.fn(),
  onUpdateRate: jest.fn(),
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

const defaultIncomeViewModel: IncomeSectionVM = {
  filter: "ALL",
  isLoading: false,
  items: [],
  onAdd: jest.fn(),
  onEdit: jest.fn(),
  onFilterChange: jest.fn(),
  onReceive: jest.fn(),
  suggestionActions: {
    failure: undefined,
    isBusy: false,
    onApprove: jest.fn(),
    onEdit: jest.fn(),
    onReject: jest.fn(),
  },
  suggestions: [],
  summary: undefined,
  today: "2026-11-11",
};

const eventActions = {
  failure: undefined,
  isBusy: false,
  onApprove: jest.fn(),
  onEdit: jest.fn(),
  onReject: jest.fn(),
};

function setup(
  overrides: Partial<InvestmentDetailVM> = {},
  eventSuggestions: InvestmentEventSuggestion[] = [],
) {
  jest.mocked(useEventSuggestions).mockReturnValue(eventSuggestions);
  jest.mocked(useEventSuggestionActions).mockReturnValue(eventActions);
  jest
    .mocked(useIncomeSectionViewModel)
    .mockReturnValue(defaultIncomeViewModel);
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useInvestmentDetailViewModel).mockReturnValue(vm);

  return { vm, ...render(<InvestmentDetail />) };
}

export { defaultIncomeViewModel, defaultViewModel, eventActions, setup };
