import { render } from "@tests";

import { InvestmentMarketIndexHistory } from "@domain/entities/investment/InvestmentEntities";

import IndexHistoryModal from "../";
import { IndexHistoryVM, useIndexHistoryViewModel } from "../hooks";

jest.mock("../hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const history: InvestmentMarketIndexHistory = {
  changes: [
    { delta: "0.75", since: "2026-06-18", value: "14.90" },
    { delta: "0.50", since: "2026-03-19", value: "14.15" },
    { delta: null, since: "2025-12-11", value: "13.65" },
  ],
  followers: [
    { assetId: "asset-1", name: "CDB Banco Exemplo", percent: "110" },
  ],
  index: "CDI",
  points: [
    { date: "2025-12-11", value: "13.65" },
    { date: "2026-03-19", value: "14.15" },
    { date: "2026-06-18", value: "14.90" },
  ],
};

const handlers = {
  onAssetPress: jest.fn(),
  onClose: jest.fn(),
  onPeriodChange: jest.fn(),
  onRetry: jest.fn(),
};

function setup(overrides: Partial<IndexHistoryVM> = {}) {
  jest.mocked(useIndexHistoryViewModel).mockReturnValue({
    ...handlers,
    history,
    index: "CDI",
    isError: false,
    isLoading: false,
    period: "12m",
    ...overrides,
  });

  return render(<IndexHistoryModal />);
}

export { handlers, history, setup };
