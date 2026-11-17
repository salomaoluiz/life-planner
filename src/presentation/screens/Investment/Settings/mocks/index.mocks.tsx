import { render } from "@tests";

import { InvestmentMarketIndexes } from "@domain/entities/investment/InvestmentEntities";

import InvestmentSettings from "../";
import { InvestmentSettingsVM, useInvestmentSettingsViewModel } from "../hooks";

jest.mock("../hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const indexes: InvestmentMarketIndexes = {
  cdi: {
    annual: "14.90",
    daily: "0.05513100",
    date: "2026-11-11",
    followers: 4,
    lastChangeDate: "2026-06-18",
    stale: false,
  },
  fx: [{ pair: "USD-BRL", quotedAt: "2026-11-12T11:05:00Z", rate: "5.350000" }],
  ipca: {
    accumulated12m: "4.68",
    expected12m: "4.20",
    expectedDate: "2026-11-11",
    followers: 1,
    month: "2026-10",
    monthly: "0.32",
    stale: false,
  },
  lastSuccessAt: "2026-11-12T13:10:00.000Z",
  selic: {
    daily: "0.05546000",
    date: "2026-11-11",
    followers: 0,
    lastChangeDate: "2026-06-18",
    stale: false,
    target: "15.00",
  },
};

const handlers = {
  onOpenHistory: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onToastHide: jest.fn(),
};

function setup(overrides: Partial<InvestmentSettingsVM> = {}) {
  jest
    .mocked(useInvestmentSettingsViewModel)
    .mockReturnValue(viewModel(overrides));

  return render(<InvestmentSettings />);
}

function viewModel(
  overrides: Partial<InvestmentSettingsVM> = {},
): InvestmentSettingsVM {
  return {
    ...handlers,
    data: indexes,
    isEmpty: false,
    isError: false,
    isLoading: false,
    notice: null,
    refreshing: false,
    toastVisible: false,
    updated: {
      key: "investment.settings.when.today",
      params: { time: "19:05" },
    },
    ...overrides,
  };
}

export { handlers, indexes, setup };
