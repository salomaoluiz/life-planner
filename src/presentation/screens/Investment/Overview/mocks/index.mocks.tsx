import { render } from "@tests";

import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import {
  InvestmentDashboardRanking,
  InvestmentsDashboard,
} from "@domain/entities/investment/InvestmentEntities";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import InvestmentOverview from "../";
import { InvestmentOverviewVM, useInvestmentOverviewViewModel } from "../hooks";

jest.mock("../hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

function ranking(
  index: number,
  overrides: Partial<InvestmentDashboardRanking> = {},
): InvestmentDashboardRanking {
  return {
    assetClass: InvestmentAssetClass.BR_STOCK,
    assetId: `asset-${index}`,
    currency: "BRL",
    name: `Asset ${index}`,
    openResult: 10_000,
    openResultPercent: 0.1,
    share: 0.1,
    ticker: `TCK${index}`,
    value: 1_000_000 - index,
    valueKind: "QUOTE",
    ...overrides,
  };
}

const dashboard: InvestmentsDashboard = {
  allocation: [
    {
      assetClass: InvestmentAssetClass.BR_STOCK,
      share: 0.34,
      value: 6_266_899,
    },
    {
      assetClass: InvestmentAssetClass.FOREIGN_STOCK,
      share: 0.66,
      usd: {
        fxRate: "5.5601",
        resultFromAsset: 515_047,
        resultFromFx: 155_732,
        value: "4628.00",
      },
      value: 12_165_156,
    },
  ],
  incomes: [
    {
      byType: { DIVIDEND: 1, INTEREST: 0, JCP: 2, OTHER: 0, YIELD: 0 },
      date: "2026-11-30",
      planned: 41_000,
      received: 128_430,
    },
  ],
  period: { bucket: "MONTH", from: "2025-12-01", to: "2026-11-04" },
  ranking: [ranking(1), ranking(2, { usdValue: "4628.00" })],
  series: [
    { date: "2026-01-31", invested: null, marketValue: null },
    { date: "2026-03-31", invested: 100_000, marketValue: 100_000 },
    { date: "2026-06-30", invested: 100_000, marketValue: 120_000 },
  ],
  summary: {
    assetsWithoutValue: 0,
    currentValue: 18_432_055,
    historyStartsAt: null,
    incomePlanned: 41_000,
    incomeReceived: 984_620,
    invested: 16_290_000,
    openResult: 2_142_055,
    openResultPercent: 0.1315,
    operationsWithoutFxRate: 0,
    realizedResult: 318_040,
    salesCount: 4,
    staleQuotes: 0,
  },
};

const handlers = {
  onAddAsset: jest.fn(),
  onApplyCustomPeriod: jest.fn(),
  onAssetPress: jest.fn(),
  onBackToToday: jest.fn(),
  onClassClear: jest.fn(),
  onClassSelect: jest.fn(),
  onCustomClose: jest.fn(),
  onIncomeSelect: jest.fn(),
  onNextPeriod: jest.fn(),
  onOwnerFilterChange: jest.fn(),
  onPointSelect: jest.fn(),
  onPresetChange: jest.fn(),
  onPresetReselect: jest.fn(),
  onPreviousPeriod: jest.fn(),
  onRetry: jest.fn(),
  onSeeAll: jest.fn(),
};

function query(
  data?: InvestmentsDashboard,
  status: "error" | "pending" | "success" = data ? "success" : "pending",
) {
  const fixture = new UseQueryFixture<InvestmentsDashboard>();

  if (data) {
    fixture.withData(data);
  }
  fixture.value.status = status;

  return fixture.build();
}

function setup(overrides: Partial<InvestmentOverviewVM> = {}) {
  jest
    .mocked(useInvestmentOverviewViewModel)
    .mockReturnValue(viewModel(overrides));

  return render(<InvestmentOverview />);
}

function viewModel(
  overrides: Partial<InvestmentOverviewVM> = {},
): InvestmentOverviewVM {
  return {
    ...handlers,
    canGoNext: false,
    customInitial: { from: "2025-01-01", to: "2026-11-04" },
    customOpen: false,
    dashboard: query(dashboard),
    expanded: false,
    isEmpty: false,
    ownerChoices: [{ labelKey: "financial.common.all", value: "ALL" }],
    ownerFilter: "ALL",
    ownerIds: ["user-id"],
    period: { from: "2025-12-01", to: "2026-11-04" },
    preset: "12M",
    readOnlyScope: {
      guard: (action: () => void) => action,
      notifyReadOnly: jest.fn(),
      onToastHide: jest.fn(),
      readOnly: false,
      toastVisible: false,
    },
    selectedClass: undefined,
    selectedIncome: undefined,
    selectedPoint: undefined,
    showToday: false,
    today: "2026-11-04",
    ...overrides,
  } as unknown as InvestmentOverviewVM;
}

export { dashboard, handlers, query, ranking, setup, viewModel };
