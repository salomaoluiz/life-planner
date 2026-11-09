import { render } from "@tests";

import ValuationModal from "../";
import { useValuationModalViewModel, ValuationModalVM } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ValuationModalVM = {
  date: new Date(2026, 10, 4),
  failure: undefined,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onSave: jest.fn(),
  onUnitPriceChange: jest.fn(),
  positionText: undefined,
  unitPrice: "",
  unitPriceError: undefined,
};

function setup(overrides: Partial<ValuationModalVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useValuationModalViewModel).mockReturnValue(vm);

  return { vm, ...render(<ValuationModal />) };
}

export { defaultViewModel, setup };
