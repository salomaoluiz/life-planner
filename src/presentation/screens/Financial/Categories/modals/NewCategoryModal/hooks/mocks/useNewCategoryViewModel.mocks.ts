import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useNewCategoryViewModel from "../useNewCategoryViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    createFinancialCategoryUseCase: {
      execute: jest.fn(),
      uniqueName: "create",
    },
    deleteFinancialCategoryUseCase: {
      execute: jest.fn(),
      uniqueName: "delete",
    },
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "categories",
    },
    getFinancialTransactionsUseCase: {
      execute: jest.fn(),
      uniqueName: "transactions",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
    updateFinancialCategoryUseCase: {
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

function cat(
  id: string,
  overrides: Partial<ConstructorParameters<typeof CategoryDTO>[0]> = {},
) {
  return new CategoryDTO({
    icon: "folder",
    iconColor: "#6366F1",
    id,
    name: id,
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    ...overrides,
  });
}

function tx(categoryId: string) {
  return new TransactionDTO({
    accountId: "a1",
    category: categoryId,
    categoryId,
    date: new Date(2026, 8, 30).toISOString(),
    description: "Shop",
    id: `tx-${categoryId}`,
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: "10.00",
  });
}

const queries: Record<string, UseQueryFixture<unknown>> = {};
const mutations: Record<string, UseMutationFixture<unknown, unknown>> = {};
// endregion mocks

// region spies
const spies = {
  back: jest.mocked(router.back),
  params: jest.mocked(useLocalSearchParams),
  push: jest.mocked(router.push),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  ["owners", "categories", "transactions"].forEach((key) => {
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
    categories?: CategoryDTO[];
    params?: Record<string, string>;
    transactions?: TransactionDTO[];
  } = {},
) {
  queries.owners.withData(owners);
  queries.categories.withData(data.categories ?? []);
  queries.transactions.withData(data.transactions ?? []);
  spies.params.mockReturnValue(data.params ?? {});
}

function setup() {
  return renderHook(() => useNewCategoryViewModel());
}

export { cat, givenLoaded, mutations, queries, setup, spies, tx };
