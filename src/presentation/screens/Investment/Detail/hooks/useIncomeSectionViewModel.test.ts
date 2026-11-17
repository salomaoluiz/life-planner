import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { makeIncome, makeSuggestion } from "@screens/Investment/mocks/fixtures";

import useIncomeSectionViewModel from "./useIncomeSectionViewModel";

jest.mock("@infrastructure/fetcher");
jest.mock(
  "@screens/Investment/Income/hooks/useIncomeSuggestionActions",
  () => ({
    __esModule: true,
    default: () => ({ failure: undefined, isBusy: false }),
  }),
);
jest.mock("@application/useCases", () => ({
  useCases: {
    getInvestmentIncomeSeriesProjectionsUseCase: {
      execute: jest.fn(),
      uniqueName: "projections",
    },
    getInvestmentIncomeSeriesUseCase: {
      execute: jest.fn(),
      uniqueName: "series",
    },
    getInvestmentIncomeSuggestionsUseCase: {
      execute: jest.fn(),
      uniqueName: "suggestions",
    },
    getInvestmentIncomesUseCase: { execute: jest.fn(), uniqueName: "incomes" },
  },
}));

const incomes = new UseQueryFixture();
const projections = new UseQueryFixture();
const series = new UseQueryFixture();
const suggestions = new UseQueryFixture();

beforeEach(() => {
  jest.clearAllMocks();
  incomes.reset();
  projections.reset();
  series.reset();
  suggestions.reset();
  jest.mocked(useQuery).mockImplementation(((props: { cacheKey: string[] }) => {
    if (props.cacheKey.includes("income-projections")) {
      return projections.build();
    }
    if (props.cacheKey.includes("income-series-list")) {
      return series.build();
    }

    return (props.cacheKey.includes("incomes") ? incomes : suggestions).build();
  }) as never);
});

function setup() {
  return renderHook(() => useIncomeSectionViewModel("asset-1"));
}

it("SHOULD be loading, then list the incomes, the summary AND the suggestions", () => {
  incomes.value.isFetching = true;
  expect(setup().result.current.isLoading).toBe(true);

  incomes.reset().withData({
    items: [makeIncome()],
    nextCursor: null,
    summary: {
      currency: "BRL",
      pendingSuggestions: 1,
      plannedTotal: 0,
      receivedThisYear: 7140,
    },
  });
  suggestions.withData([makeSuggestion()]);
  const { result } = setup();

  expect(result.current.isLoading).toBe(false);
  expect(result.current.items).toHaveLength(1);
  expect(result.current.summary?.receivedThisYear).toBe(7140);
  expect(result.current.suggestions).toHaveLength(1);
});

it("SHOULD default to empty lists", () => {
  const { result } = setup();

  expect(result.current.items).toEqual([]);
  expect(result.current.suggestions).toEqual([]);
  expect(result.current.filter).toBe("ALL");
});

it("SHOULD change the filter", () => {
  const { result } = setup();

  act(() => result.current.onFilterChange("PLANNED"));

  expect(result.current.filter).toBe("PLANNED");
});

it("SHOULD open the income modals", () => {
  const { result } = setup();

  act(() => result.current.onAdd());
  act(() => result.current.onEdit("income-1"));
  act(() => result.current.onReceive("income-1"));

  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(
    1,
    "investment_income",
    {
      assetId: "asset-1",
    },
  );
  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(
    2,
    "investment_income",
    {
      assetId: "asset-1",
      id: "income-1",
    },
  );
  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(
    3,
    "investment_income_receive",
    {
      id: "income-1",
    },
  );
});

describe("series (spec 115)", () => {
  const monthly = {
    amountPerUnit: "1.1",
    assetId: "asset-1",
    currency: "BRL",
    firstPaymentDate: "2025-01-15",
    frequency: { interval: 1, unit: "MONTH" },
    id: "series-1",
    lastGeneratedNumber: 23,
    type: "YIELD",
    withFinance: true,
  };

  function projected(seriesId: string, number: number, assetId = "asset-1") {
    return {
      assetId,
      netAmount: 11000,
      number,
      paymentDate: `2026-12-${10 + number}`,
      quantity: "100",
      seriesId,
    };
  }

  it("SHOULD list the series of the asset by id AND edit one", () => {
    series.withData([monthly]);

    const { result } = setup();

    expect(result.current.series).toHaveLength(1);
    expect(result.current.seriesById.get("series-1")).toMatchObject({
      id: "series-1",
    });

    act(() => result.current.onEditSeries("series-1"));

    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_income",
      {
        seriesId: "series-1",
      },
    );
  });

  it("SHOULD keep only the next 3 occurrences of each series of this asset", () => {
    series.withData([monthly]);
    projections.withData([
      projected("series-1", 24),
      projected("series-1", 25),
      projected("series-1", 26),
      projected("series-1", 27),
      projected("series-2", 3, "other-asset"),
    ]);

    const { result } = setup();

    expect(result.current.projected.map((item) => item.number)).toEqual([
      24, 25, 26,
    ]);
  });

  it("SHOULD not ask for projections WHEN every series is over", () => {
    series.withData([{ ...monthly, endedAt: "2026-09-15" }]);

    const { result } = setup();

    expect(result.current.projected).toEqual([]);
    expect(
      jest
        .mocked(useQuery)
        .mock.calls.some(
          ([props]) =>
            props.cacheKey.includes("income-projections") &&
            props.enabled === false,
        ),
    ).toBe(true);
  });
});
