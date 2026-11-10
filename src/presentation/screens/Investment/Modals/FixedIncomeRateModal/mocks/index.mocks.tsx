import { render } from "@tests";

import { InvestmentFixedIncomeRateMode } from "@domain/entities/investment/enums";
import {
  makeFixedIncome,
  makeFixedIncomeDetail,
} from "@screens/Investment/mocks/fixtures";

import FixedIncomeRateModal from "../";
import { FixedIncomeRateVM, useFixedIncomeRateViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: FixedIncomeRateVM = {
  asset: makeFixedIncomeDetail(),
  failure: undefined,
  form: {
    annualRate: "",
    cdiPercent: "110",
    indexRate: "14,90",
    mode: InvestmentFixedIncomeRateMode.CDI_PERCENT,
    spread: "",
  },
  history: makeFixedIncome().rates,
  invalid: false,
  isEditing: false,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  onClose: jest.fn(),
  onFormChange: jest.fn(),
  onSave: jest.fn(),
  onStartDateChange: jest.fn(),
  startDate: new Date(2026, 9, 1),
  startText: "2026-10-01",
};

function setup(overrides: Partial<FixedIncomeRateVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useFixedIncomeRateViewModel).mockReturnValue(vm);

  return { vm, ...render(<FixedIncomeRateModal />) };
}

export { defaultViewModel, setup };
