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
    getInvestmentIncomeSuggestionsUseCase: {
      execute: jest.fn(),
      uniqueName: "suggestions",
    },
    getInvestmentIncomesUseCase: { execute: jest.fn(), uniqueName: "incomes" },
  },
}));

const incomes = new UseQueryFixture();
const suggestions = new UseQueryFixture();

beforeEach(() => {
  jest.clearAllMocks();
  incomes.reset();
  suggestions.reset();
  jest
    .mocked(useQuery)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      (props.cacheKey.includes("incomes")
        ? incomes
        : suggestions
      ).build()) as never);
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
