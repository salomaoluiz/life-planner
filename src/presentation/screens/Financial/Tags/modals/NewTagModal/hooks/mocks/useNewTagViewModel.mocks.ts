import { router, useLocalSearchParams } from "expo-router";

import { renderHook } from "@tests";

import TagDTO from "@application/dto/financial/TagDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useNewTagViewModel from "../useNewTagViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    createFinancialTagUseCase: { execute: jest.fn(), uniqueName: "create" },
    deleteFinancialTagUseCase: { execute: jest.fn(), uniqueName: "delete" },
    getFinancialTagsUseCase: { execute: jest.fn(), uniqueName: "tags" },
    getFinancialTransactionsUseCase: {
      execute: jest.fn(),
      uniqueName: "transactions",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
    updateFinancialTagUseCase: { execute: jest.fn(), uniqueName: "update" },
  },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Family", type: OwnerType.FAMILY }),
];

function tag(
  id: string,
  overrides: Partial<ConstructorParameters<typeof TagDTO>[0]> = {},
) {
  return new TagDTO({
    id,
    name: id,
    owner: "USER",
    ownerId: "user-id",
    usageCount: 0,
    ...overrides,
  });
}

const queries: Record<string, UseQueryFixture<unknown>> = {};
const mutations: Record<string, UseMutationFixture<unknown, unknown>> = {};

const spies = {
  back: jest.mocked(router.back),
  params: jest.mocked(useLocalSearchParams),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  ["owners", "tags"].forEach((key) => {
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
  data: { params?: Record<string, string>; tags?: TagDTO[] } = {},
) {
  queries.owners.withData(owners);
  queries.tags.withData(data.tags ?? []);
  spies.params.mockReturnValue(data.params ?? {});
}

function setup() {
  return renderHook(() => useNewTagViewModel());
}

export { givenLoaded, mutations, queries, setup, spies, tag };
