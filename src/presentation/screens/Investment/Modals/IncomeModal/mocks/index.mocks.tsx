import { render } from "@tests";

import {
  INVESTMENT_INCOME_TYPES,
  InvestmentIncomeStatus,
  InvestmentIncomeType,
} from "@domain/entities/investment/enums";

import IncomeModal from "../";
import { IncomeModalVM, useIncomeModalViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: IncomeModalVM = {
  accountHint: "investment.income.accountDefaultHint",
  accountOptions: [{ label: "Broker", value: "acc-1" }],
  assetLabel: "PETR4",
  categoryHint: "investment.income.categoryDefaultHint",
  categoryNodes: [
    { color: "#F59E0B", icon: "cash", id: "cat-1", name: "Dividends" },
  ],
  currency: "BRL",
  errors: {},
  estimate: { gross: "R$ 84,00", rate: "15%", show: true },
  failure: undefined,
  isApproving: false,
  isDeleteOpen: false,
  isDirty: false,
  isEditing: false,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  isScopeAll: false,
  isSeries: false,
  isSeriesEdit: false,
  isSeriesIncome: false,
  net: 7140,
  occurrenceCount: undefined,
  onAccountChange: jest.fn(),
  onCategoryChange: jest.fn(),
  onClose: jest.fn(),
  onDelete: jest.fn(),
  onDeleteClose: jest.fn(),
  onDeleteOpen: jest.fn(),
  onEndDateChange: jest.fn(),
  onExDateChange: jest.fn(),
  onExDateOffsetChange: jest.fn(),
  onFrequencyChange: jest.fn(),
  onMarkPastChange: jest.fn(),
  onNetChange: jest.fn(),
  onNotesChange: jest.fn(),
  onPaymentDateChange: jest.fn(),
  onPerUnitChange: jest.fn(),
  onQuantityChange: jest.fn(),
  onRepeatChange: jest.fn(),
  onSave: jest.fn(),
  onScopeCancel: jest.fn(),
  onScopeSelect: jest.fn(),
  onStatusChange: jest.fn(),
  onTypeChange: jest.fn(),
  onWithFinanceChange: jest.fn(),
  preview: {
    count: undefined,
    currentMonth: 0,
    endsByPosition: undefined,
    firstNet: undefined,
    firstQuantity: undefined,
    isLoading: false,
    next: [],
    past: 0,
  },
  repeatAllowed: true,
  saveDisabled: false,
  saveLabelKey: "investment.income.title.create",
  saveLabelParams: undefined,
  scope: undefined,
  scopeDate: "",
  scopeDialogVisible: false,
  seriesIncomeCount: undefined,
  showSeriesBlock: false,
  state: {
    accountId: "acc-1",
    categoryId: "cat-1",
    endDate: undefined,
    exDate: new Date(2026, 8, 10),
    exDateOffset: "",
    frequency: { interval: 1, unit: "MONTH" as const },
    markPast: true,
    netAmount: 7140,
    netTouched: true,
    notes: "",
    paymentDate: new Date(2026, 9, 30),
    perUnit: "0.28",
    quantity: "300",
    repeat: false,
    status: InvestmentIncomeStatus.PLANNED,
    type: InvestmentIncomeType.JCP,
    withFinance: true,
  },
  titleKey: "investment.income.title.create",
  tooMany: false,
  typeOptions: INVESTMENT_INCOME_TYPES,
};

function setup(overrides: Partial<IncomeModalVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useIncomeModalViewModel).mockReturnValue(vm);

  return { vm, ...render(<IncomeModal />) };
}

export { defaultViewModel, setup };
