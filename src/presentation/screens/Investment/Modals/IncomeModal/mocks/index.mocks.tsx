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
  categoryOptions: [{ label: "Dividends", value: "cat-1" }],
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
  net: 7140,
  onAccountChange: jest.fn(),
  onCategoryChange: jest.fn(),
  onClose: jest.fn(),
  onDelete: jest.fn(),
  onDeleteClose: jest.fn(),
  onDeleteOpen: jest.fn(),
  onExDateChange: jest.fn(),
  onNetChange: jest.fn(),
  onNotesChange: jest.fn(),
  onPaymentDateChange: jest.fn(),
  onPerUnitChange: jest.fn(),
  onQuantityChange: jest.fn(),
  onSave: jest.fn(),
  onStatusChange: jest.fn(),
  onTypeChange: jest.fn(),
  saveLabelKey: "investment.income.title.create",
  state: {
    accountId: "acc-1",
    categoryId: "cat-1",
    exDate: new Date(2026, 8, 10),
    netAmount: 7140,
    netTouched: true,
    notes: "",
    paymentDate: new Date(2026, 9, 30),
    perUnit: "0.28",
    quantity: "300",
    status: InvestmentIncomeStatus.PLANNED,
    type: InvestmentIncomeType.JCP,
  },
  titleKey: "investment.income.title.create",
  typeOptions: INVESTMENT_INCOME_TYPES,
};

function setup(overrides: Partial<IncomeModalVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useIncomeModalViewModel).mockReturnValue(vm);

  return { vm, ...render(<IncomeModal />) };
}

export { defaultViewModel, setup };
