import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import AccountDTO from "@application/dto/financial/AccountDTO";
import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useNewCreditCardViewModel from "../useNewCreditCardViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    createFinancialCreditCardUseCase: {
      execute: jest.fn(),
      uniqueName: "create",
    },
    deleteFinancialCreditCardUseCase: {
      execute: jest.fn(),
      uniqueName: "delete",
    },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialCreditCardsOverviewUseCase: {
      execute: jest.fn(),
      uniqueName: "overview",
    },
    getFinancialCreditCardsUseCase: { execute: jest.fn(), uniqueName: "cards" },
    getFinancialRecurrencesUseCase: {
      execute: jest.fn(),
      uniqueName: "recurrences",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
    updateFinancialCreditCardUseCase: {
      execute: jest.fn(),
      uniqueName: "update",
    },
  },
}));

// region mocks
const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Family", type: OwnerType.FAMILY }),
];

function card(
  id: string,
  overrides: Partial<ConstructorParameters<typeof CreditCardDTO>[0]> = {},
) {
  return new CreditCardDTO({
    brand: "VISA",
    closingDay: 5,
    color: "#6366F1",
    dueDay: 8,
    id,
    lastDigits: "1234",
    limit: 100000,
    owner: "USER",
    ownerId: "user-id",
    paymentDay: 6,
    status: "ACTIVE",
    title: id,
    ...overrides,
  });
}

const queries: Record<string, UseQueryFixture<unknown>> = {};
const mutations: Record<string, UseMutationFixture<unknown, unknown>> = {};
// endregion mocks

// region spies
const spies = {
  back: jest.mocked(router.back),
  getRecurrences: jest.mocked(useCases.getFinancialRecurrencesUseCase.execute),
  invalidate: jest.mocked(invalidateFetcherData),
  params: jest.mocked(useLocalSearchParams),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  ["owners", "cards", "recurrences", "accounts"].forEach((key) => {
    queries[key] = new UseQueryFixture<unknown>();
  });
  ["create", "update", "delete"].forEach((key) => {
    mutations[key] = new UseMutationFixture<unknown, unknown>();
  });
  spies.params.mockReturnValue({});
  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) =>
    queries[options.cacheKey[0]].build()) as never);
  spies.useMutation.mockImplementation(((options: { cacheKey: string[] }) =>
    mutations[options.cacheKey[0]].build()) as never);
});

function givenLoaded(
  data: {
    accounts?: AccountDTO[];
    cards?: CreditCardDTO[];
    params?: Record<string, string>;
  } = {},
) {
  queries.owners.withData(owners);
  queries.cards.withData(data.cards ?? []);
  queries.accounts.withData(data.accounts ?? []);
  spies.params.mockReturnValue(data.params ?? {});
}

function setup() {
  return renderHook(() => useNewCreditCardViewModel());
}

export { card, givenLoaded, mutations, queries, setup, spies };
