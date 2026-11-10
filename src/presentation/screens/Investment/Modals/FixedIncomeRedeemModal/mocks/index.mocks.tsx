import { render } from "@tests";

import { InvestmentFixedIncomeRedemptionKind } from "@domain/entities/investment/enums";
import { makeFixedIncomeDetail } from "@screens/Investment/mocks/fixtures";

import FixedIncomeRedeemModal from "../";
import { FixedIncomeRedeemVM, useFixedIncomeRedeemViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: FixedIncomeRedeemVM = {
  accountId: "acc-1",
  accountOptions: [{ label: "Broker · BRL", value: "acc-1" }],
  asset: makeFixedIncomeDetail(),
  availableNet: null,
  date: new Date(2026, 10, 4),
  failure: undefined,
  generate: true,
  isLoading: false,
  isNotFound: false,
  isPreviewing: false,
  isSaving: false,
  kind: InvestmentFixedIncomeRedemptionKind.PARTIAL,
  liquidityWarning: null,
  netCents: 600000,
  netError: false,
  onAccountChange: jest.fn(),
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onGenerateChange: jest.fn(),
  onKindChange: jest.fn(),
  onNetChange: jest.fn(),
  onSave: jest.fn(),
  preview: {
    gross: 613935,
    iof: 0,
    ir: 13935,
    liquidityWarning: null,
    lots: [
      {
        date: "2026-01-15",
        gross: 613935,
        operationId: "lot-1",
        principalUsed: 544246,
      },
    ],
    net: 600000,
    remaining: { gross: 1017131, principal: 955754 },
  },
};

function setup(overrides: Partial<FixedIncomeRedeemVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useFixedIncomeRedeemViewModel).mockReturnValue(vm);

  return { vm, ...render(<FixedIncomeRedeemModal />) };
}

export { defaultViewModel, setup };
