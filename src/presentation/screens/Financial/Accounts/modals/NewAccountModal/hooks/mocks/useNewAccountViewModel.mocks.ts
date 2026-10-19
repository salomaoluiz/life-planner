import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import AccountDTO from "@application/dto/financial/AccountDTO";
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

import useNewAccountViewModel from "../useNewAccountViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    adjustFinancialAccountBalanceUseCase: {
      execute: jest.fn(),
      uniqueName: "adjust",
    },
    createFinancialAccountUseCase: {
      execute: jest.fn(),
      uniqueName: "create",
    },
    deleteFinancialAccountUseCase: {
      execute: jest.fn(),
      uniqueName: "delete",
    },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialRecurrencesUseCase: {
      execute: jest.fn(),
      uniqueName: "recurrences",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
    updateFinancialAccountUseCase: {
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

function acc(
  id: string,
  balance = 0,
  overrides: Partial<ConstructorParameters<typeof AccountDTO>[0]> = {},
) {
  return new AccountDTO({
    balance,
    icon: "bank",
    id,
    name: id,
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
    ...overrides,
  });
}

const queries: Record<string, UseQueryFixture<unknown>> = {};
const mutations: Record<string, UseMutationFixture<unknown, unknown>> = {};
// endregion mocks

// region spies
const spies = {
  adjust: jest.mocked(useCases.adjustFinancialAccountBalanceUseCase.execute),
  back: jest.mocked(router.back),
  getRecurrences: jest.mocked(useCases.getFinancialRecurrencesUseCase.execute),
  invalidate: jest.mocked(invalidateFetcherData),
  params: jest.mocked(useLocalSearchParams),
  update: jest.mocked(useCases.updateFinancialAccountUseCase.execute),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  ["owners", "accounts", "recurrences"].forEach((key) => {
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
  data: { accounts?: AccountDTO[]; params?: Record<string, string> } = {},
) {
  queries.owners.withData(owners);
  queries.accounts.withData(data.accounts ?? []);
  spies.params.mockReturnValue(data.params ?? {});
}

function setup() {
  return renderHook(() => useNewAccountViewModel());
}

export { acc, givenLoaded, mutations, queries, setup, spies };
