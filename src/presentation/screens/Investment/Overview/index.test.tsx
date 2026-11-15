import { fireEvent, render, screen } from "@tests";

import useInvestmentOverviewViewModel from "./hooks/useInvestmentOverviewViewModel";
import InvestmentOverview from "./index";
import overviewTestIds from "./testIds";

jest.mock("./hooks/useInvestmentOverviewViewModel");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const mockSectionSelect = jest.fn();

jest.mock("@screens/Investment/Layout/hooks/useInvestmentSections", () => ({
  __esModule: true,
  default: () => ({
    onSelect: (section: string) => mockSectionSelect(section),
    section: "overview",
    tabs: [
      {
        label: "Overview",
        section: "overview",
        testID: "investment.sections.overview",
      },
      {
        label: "Assets",
        section: "assets",
        testID: "investment.sections.assets",
      },
    ],
  }),
}));

const vm = {
  allocation: {
    centerLabel: "Total",
    centerValue: "R$ 184,3 mil",
    legend: "alloc",
    rows: [
      {
        assetClass: "BR_STOCK",
        label: "Stocks",
        percent: "60%",
        pressed: false,
        share: 0.6,
        swatch: "#4F5BD5",
        valueText: "R$ 62.668,99",
      },
    ],
  },
  bucketUnit: "month",
  canGoNext: false,
  customOpen: false,
  emptyMessage: "No investments yet",
  expanded: false,
  hasPositions: true,
  historyStartsAt: "2025-08-04",
  income: [
    {
      byType: ["DIVIDEND"],
      label: "nov",
      planned: 41000,
      received: 128430,
      receivedText: "R$ 1.284,30",
    },
  ],
  isFetching: false,
  labels: ["nov"],
  noValue: "0 assets have no value yet; counted at cost",
  onAddAsset: jest.fn(),
  onClearFilter: jest.fn(),
  onCustomApply: jest.fn(),
  onCustomClose: jest.fn(),
  onCustomOpen: jest.fn(),
  onNext: jest.fn(),
  onOpenAsset: jest.fn(),
  onOwnerFilterChange: jest.fn(),
  onPresetChange: jest.fn(),
  onPrevious: jest.fn(),
  onRetry: jest.fn(),
  onSeeAll: jest.fn(),
  onSelectClass: jest.fn(),
  onSelectPoint: jest.fn(),
  onToday: jest.fn(),
  ownerChoices: [{ labelKey: "financial.common.all", value: "ALL" }],
  ownerFilter: "ALL",
  period: { from: "2025-12-01", to: "2026-11-04" },
  preset: "12M",
  presets: ["1M", "3M", "6M", "12M", "YEAR", "CUSTOM"],
  ranking: {
    rows: [
      {
        assetId: "asset-1",
        barShare: 1,
        name: "Apple Inc.",
        resultPercent: "+35.25%",
        resultText: "+ R$ 6.707,79",
        subline: "US$ 4.628 · 11%",
        swatch: "#1C7C7D",
        ticker: "AAPL",
        tone: "income",
        valueText: "R$ 25.732,00",
      },
    ],
    total: 1,
  },
  rankingFilterLabel: undefined,
  selectedClass: undefined,
  selectedPoint: undefined,
  series: [{ date: "2026-11-04", invested: 16290000, marketValue: 18432055 }],
  showNoValue: false,
  showStale: false,
  staleMessage: "",
  status: "success",
  summary: undefined,
  tiles: [
    {
      caption: "on 4 Nov 2026",
      label: "Current value",
      testID: overviewTestIds.tileCurrentValue,
      value: "R$ 184.320,55",
    },
    {
      caption: "cost",
      label: "Invested",
      testID: overviewTestIds.tileInvested,
      value: "R$ 162.900,00",
    },
    {
      caption: "+13.15%",
      label: "Open result",
      testID: overviewTestIds.tileOpenResult,
      tone: "income" as const,
      value: "+ R$ 21.420,55",
    },
    {
      caption: "4 sales",
      label: "Realized result",
      testID: overviewTestIds.tileRealized,
      value: "+ R$ 3.180,40",
    },
    {
      caption: "received",
      label: "Income",
      testID: overviewTestIds.tileIncome,
      value: "R$ 9.846,20",
    },
  ],
  today: "2026-11-04",
  totalRanking: 1,
};

function setup(overrides: Partial<typeof vm> = {}) {
  jest
    .mocked(useInvestmentOverviewViewModel)
    .mockReturnValue({ ...vm, ...overrides } as never);
  render(<InvestmentOverview />);
}

it("SHOULD render the five tiles, the charts AND the ranking", () => {
  setup();

  [
    overviewTestIds.tileCurrentValue,
    overviewTestIds.tileInvested,
    overviewTestIds.tileOpenResult,
    overviewTestIds.tileRealized,
    overviewTestIds.tileIncome,
  ].forEach((id) => expect(screen.getByTestId(id)).toBeOnTheScreen());
  expect(screen.getByTestId(overviewTestIds.evolutionChart)).toBeOnTheScreen();
  expect(screen.getByTestId(overviewTestIds.allocation)).toBeOnTheScreen();
  expect(screen.getByTestId(overviewTestIds.incomeChart)).toBeOnTheScreen();
  expect(
    screen.getByTestId(overviewTestIds.rankingRow("asset-1")),
  ).toBeOnTheScreen();
});

it("SHOULD switch sections from the tabs", () => {
  setup();

  fireEvent.press(screen.getByTestId("investment.sections.assets"));

  expect(mockSectionSelect).toHaveBeenCalledWith("assets");
});

it("SHOULD filter the ranking by class AND open the asset", () => {
  setup();

  fireEvent.press(
    screen.getByTestId(overviewTestIds.allocationClass("BR_STOCK")),
  );
  expect(vm.onSelectClass).toHaveBeenCalledWith("BR_STOCK");

  fireEvent.press(screen.getByTestId(overviewTestIds.rankingRow("asset-1")));
  expect(vm.onOpenAsset).toHaveBeenCalledWith("asset-1");
});

it("SHOULD offer See all while there are more positions", () => {
  setup({ totalRanking: 12 });

  fireEvent.press(screen.getByTestId(overviewTestIds.rankingSeeAll));

  expect(vm.onSeeAll).toHaveBeenCalled();
});

it("SHOULD show the stale warning and the no-value caption", () => {
  setup({
    noValue: "2 assets have no value yet; counted at cost",
    showNoValue: true,
    showStale: true,
    staleMessage: "Quotes of 3 assets didn't update today.",
  });

  expect(screen.getByTestId(overviewTestIds.stale)).toBeOnTheScreen();
  expect(screen.getByTestId(overviewTestIds.noValue)).toBeOnTheScreen();
});

it("SHOULD replace the blocks by the empty state AND create an asset", () => {
  setup({ hasPositions: false });

  expect(screen.getByTestId(overviewTestIds.empty)).toBeOnTheScreen();
  fireEvent.press(screen.getByText("investment.overview.newAsset"));
  expect(vm.onAddAsset).toHaveBeenCalled();
});

it("SHOULD retry from the error state", () => {
  setup({ status: "error" });

  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(vm.onRetry).toHaveBeenCalled();
});
