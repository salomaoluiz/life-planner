import { render } from "@tests";

import IncomeReceiveModal from "../";
import { IncomeReceiveModalVM, useIncomeReceiveModalViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: IncomeReceiveModalVM = {
  accountId: "acc-1",
  accountOptions: [{ label: "Broker", value: "acc-1" }],
  assetLabel: "PETR4",
  currency: "BRL",
  failure: undefined,
  gross: "R$ 84,00",
  grossRate: "15%",
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  net: 7215,
  onAccountChange: jest.fn(),
  onClose: jest.fn(),
  onDelete: jest.fn(),
  onNetChange: jest.fn(),
  onReceivedOnChange: jest.fn(),
  onSave: jest.fn(),
  planned: "R$ 71,40",
  plannedFor: "28/10/2026",
  receivedOn: new Date(2026, 10, 4),
  showGross: true,
  typeKey: "investment.income.types.JCP",
};

function setup(overrides: Partial<IncomeReceiveModalVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useIncomeReceiveModalViewModel).mockReturnValue(vm);

  return { vm, ...render(<IncomeReceiveModal />) };
}

export { defaultViewModel, setup };
