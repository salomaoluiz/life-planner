import { render } from "@tests";

import FractionSaleModal from "../";
import { FractionSaleModalVM, useFractionSaleModalViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: FractionSaleModalVM = {
  accountId: "acc-1",
  accountOptions: [{ label: "Broker", value: "acc-1" }],
  assetLabel: "MGLU3",
  currency: "BRL",
  date: new Date(2026, 3, 4),
  errors: { account: false, date: undefined, fees: false, gross: false },
  eventDate: "10/03/2026",
  eventTypeKey: "investment.operation.REVERSE_SPLIT",
  failure: undefined,
  feeKinds: ["BROKERAGE", "EXCHANGE_FEES"] as FractionSaleModalVM["feeKinds"],
  fees: [],
  fractionCost: "R$ 5,06",
  fractionQuantity: "0,5",
  gross: 520,
  isEdit: false,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  onAccountChange: jest.fn(),
  onAddFee: jest.fn(),
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onDelete: jest.fn(),
  onFeeAmountChange: jest.fn(),
  onFeeKindChange: jest.fn(),
  onFeeRemove: jest.fn(),
  onGrossChange: jest.fn(),
  onSave: jest.fn(),
  onWriteOffChange: jest.fn(),
  realized: "+R$ 0,14",
  realizedTone: "income",
  writeOff: false,
};

function setup(overrides: Partial<FractionSaleModalVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useFractionSaleModalViewModel).mockReturnValue(vm);

  return { vm, ...render(<FractionSaleModal />) };
}

export { defaultViewModel, setup };
