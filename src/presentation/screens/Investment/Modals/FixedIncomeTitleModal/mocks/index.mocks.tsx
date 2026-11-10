import { render } from "@tests";

import {
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
  InvestmentFixedIncomeRateMode,
} from "@domain/entities/investment/enums";

import FixedIncomeTitleModal from "../";
import { FixedIncomeTitleVM, useFixedIncomeTitleViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: FixedIncomeTitleVM = {
  accountId: "acc-1",
  accountOptions: [{ label: "Broker · BRL", value: "acc-1" }],
  amount: 1000000,
  date: new Date(2026, 0, 15),
  errors: undefined,
  estimate: {
    atMaturity: { gross: 1357480, iof: 0, ir: 53622, net: 1303858 },
    effectiveRate: "16.510000",
  },
  estimateLoading: false,
  failure: undefined,
  generate: true,
  isSaving: false,
  liquidity: InvestmentFixedIncomeLiquidity.AT_MATURITY,
  liquidityDate: new Date(2026, 0, 15),
  maturity: new Date(2028, 0, 15),
  name: "CDB Banco Exemplo 2028",
  onAccountChange: jest.fn(),
  onAmountChange: jest.fn(),
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onGenerateChange: jest.fn(),
  onLiquidityChange: jest.fn(),
  onLiquidityDateChange: jest.fn(),
  onMaturityChange: jest.fn(),
  onNameChange: jest.fn(),
  onOwnerChange: jest.fn(),
  onProductChange: jest.fn(),
  onRateChange: jest.fn(),
  onSave: jest.fn(),
  onTaxExemptChange: jest.fn(),
  ownerChoices: [{ key: "user-1", labelKey: "personal" } as never],
  ownerId: "user-1",
  product: InvestmentFixedIncomeProduct.CDB,
  rate: {
    annualRate: "",
    cdiPercent: "110",
    indexRate: "14,90",
    mode: InvestmentFixedIncomeRateMode.CDI_PERCENT,
    spread: "",
  },
  taxExempt: false,
};

function setup(overrides: Partial<FixedIncomeTitleVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useFixedIncomeTitleViewModel).mockReturnValue(vm);

  return { vm, ...render(<FixedIncomeTitleModal />) };
}

export { defaultViewModel, setup };
