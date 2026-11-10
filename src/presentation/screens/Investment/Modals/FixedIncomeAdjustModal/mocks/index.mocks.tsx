import { render } from "@tests";

import { makeFixedIncomeDetail } from "@screens/Investment/mocks/fixtures";

import FixedIncomeAdjustModal from "../";
import { FixedIncomeAdjustVM, useFixedIncomeAdjustViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: FixedIncomeAdjustVM = {
  asset: makeFixedIncomeDetail(),
  computed: 1631066,
  date: new Date(2026, 10, 4),
  dateText: "2026-11-04",
  difference: -3576,
  differencePercent: -0.0022,
  failure: undefined,
  gross: 1627490,
  grossError: false,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onGrossChange: jest.fn(),
  onSave: jest.fn(),
};

function setup(overrides: Partial<FixedIncomeAdjustVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useFixedIncomeAdjustViewModel).mockReturnValue(vm);

  return { vm, ...render(<FixedIncomeAdjustModal />) };
}

export { defaultViewModel, setup };
