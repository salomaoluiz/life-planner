import { render } from "@tests";

import { makeFixedIncomeDetail } from "@screens/Investment/mocks/fixtures";

import FixedIncomeContributionModal from "../";
import {
  FixedIncomeContributionVM,
  useFixedIncomeContributionViewModel,
} from "../hooks";

jest.mock("../hooks");

const defaultViewModel: FixedIncomeContributionVM = {
  accountId: "acc-1",
  accountOptions: [{ label: "Broker · BRL", value: "acc-1" }],
  amount: 500000,
  amountError: false,
  asset: makeFixedIncomeDetail(),
  date: new Date(2026, 9, 20),
  failure: undefined,
  generate: true,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  onAccountChange: jest.fn(),
  onAmountChange: jest.fn(),
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onGenerateChange: jest.fn(),
  onSave: jest.fn(),
};

function setup(overrides: Partial<FixedIncomeContributionVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useFixedIncomeContributionViewModel).mockReturnValue(vm);

  return { vm, ...render(<FixedIncomeContributionModal />) };
}

export { defaultViewModel, setup };
