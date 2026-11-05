import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";
import { useCaseQueryName as queryName } from "@tests/queryName";

import { CreditCardSummaryDTO } from "@application/dto/financial/CreditCardOverviewDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import invalidateFinanceData from "@screens/Financial/hooks/invalidateFinanceData";

import useConfirmProjectedViewModel from "../useConfirmProjectedViewModel";

jest.mock("@screens/Financial/hooks/invalidateFinanceData");
jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher", () => ({
  invalidateFetcherData: jest.fn(),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));
jest.mock("@application/useCases", () => {
  const names = [
    "getOwnersUseCase",
    "getFinancialCreditCardsOverviewUseCase",
    "confirmFinancialTransactionUseCase",
  ];

  return {
    useCases: Object.fromEntries(
      names.map((name) => [name, { execute: jest.fn(), uniqueName: name }]),
    ),
  };
});

const queries: Record<string, UseQueryFixture<unknown>> = {};
const mutations: Record<string, UseMutationFixture<unknown, unknown>> = {};

// Closing day 10: a charge on the 24th lands on the next month's invoice.
const summary = {
  card: {
    closingDay: 10,
    currency: "BRL",
    id: "card-1",
    ownerId: "user-id",
    title: "Main card",
  },
} as unknown as CreditCardSummaryDTO;

const spies = {
  back: jest.mocked(router.back),
  invalidateFinance: jest.mocked(invalidateFinanceData),
  params: jest.mocked(useLocalSearchParams),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 16, 12));
  ["getOwnersUseCase", "getFinancialCreditCardsOverviewUseCase"].forEach(
    (key) => {
      queries[key] = new UseQueryFixture<unknown>();
    },
  );
  mutations.confirmFinancialTransactionUseCase = new UseMutationFixture<
    unknown,
    unknown
  >();
  spies.params.mockReturnValue({
    creditCardId: "card-1",
    date: "2026-10-25",
    description: "Youtube Premium",
    id: "tx-1",
    recurring: "1",
    value: "10000",
  });
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[queryName(options.cacheKey)].build()) as never);
  spies.useMutation.mockImplementation(((options: { cacheKey: string[] }) =>
    mutations[queryName(options.cacheKey)].build()) as never);
});

function givenLoaded() {
  queries.getOwnersUseCase.withData([
    new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  ]);
  queries.getFinancialCreditCardsOverviewUseCase.withData({ cards: [summary] });
}

function setup() {
  return renderHook(() => useConfirmProjectedViewModel());
}

export { givenLoaded, mutations, setup, spies };
