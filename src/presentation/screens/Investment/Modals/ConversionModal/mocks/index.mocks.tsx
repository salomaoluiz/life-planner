import { render } from "@tests";

import ConversionModal from "../";
import { ConversionModalVM, useConversionModalViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ConversionModalVM = {
  accountId: "acc-1",
  accountOptions: [{ label: "Broker", value: "acc-1" }],
  assetClass: "BR_REIT" as ConversionModalVM["assetClass"],
  cashAmount: 0,
  currency: "BRL",
  date: new Date(2026, 9, 15),
  destinationId: "dest-1",
  destinationOptions: [{ label: "BTHF11 · 50", value: "dest-1" }],
  destinationTicker: "BTHF11",
  errors: {
    account: false,
    date: undefined,
    destination: false,
    name: false,
    ratioFrom: false,
    ratioTo: false,
    referenceValue: false,
    ticker: false,
  },
  failure: undefined,
  hasCash: false,
  isEdit: false,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  mode: "existing",
  name: "",
  onAccountChange: jest.fn(),
  onCashChange: jest.fn(),
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onDestinationChange: jest.fn(),
  onModeChange: jest.fn(),
  onNameChange: jest.fn(),
  onRatioFromChange: jest.fn(),
  onRatioToChange: jest.fn(),
  onReferenceChange: jest.fn(),
  onSubmit: jest.fn(),
  onTickerChange: jest.fn(),
  onTickerSelect: jest.fn(),
  originTicker: "BCFF11",
  preview: {
    averagePriceAfter: "R$ 10,58",
    cashCost: "R$ 0,00",
    costAfter: "R$ 8.593,38",
    costBefore: "R$ 510,00",
    costOrigin: "R$ 8.085,50",
    fractionCost: "R$ 2,12",
    fractionQuantity: "0,2",
    hasFraction: true,
    quantityAfter: "812",
    quantityBefore: "50",
    quantityIn: "762",
    quantityOrigin: "103",
    raw: "762,2",
    realizedOut: "R$ 0,00",
  },
  ratioFrom: "1",
  ratioTo: "7,4",
  referenceValue: "",
  suggestions: [],
  ticker: "",
};

function setup(overrides: Partial<ConversionModalVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useConversionModalViewModel).mockReturnValue(vm);

  return { vm, ...render(<ConversionModal />) };
}

export { defaultViewModel, setup };
