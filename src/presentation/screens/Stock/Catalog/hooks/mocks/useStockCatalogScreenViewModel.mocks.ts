import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { renderHook } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";

import { CatalogNode } from "../../models/catalogEntries";
import useStockCatalogScreenViewModel from "../useStockCatalogScreenViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher", () => ({
  invalidateFetcherData: jest.fn(),
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@application/useCases", () => ({
  useCases: {
    createStockCategorySuggestionsUseCase: {
      execute: jest.fn(),
      uniqueName: "suggest-categories",
    },
    createStockLocationSuggestionsUseCase: {
      execute: jest.fn(),
      uniqueName: "suggest-locations",
    },
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "finance",
    },
    getStockCategoriesUseCase: { execute: jest.fn(), uniqueName: "categories" },
    getStockLocationsUseCase: { execute: jest.fn(), uniqueName: "locations" },
  },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Silva", type: OwnerType.FAMILY }),
];

interface CatalogQueryData {
  categories: CatalogNode[];
  locations: CatalogNode[];
  owners: OwnerDTO[];
}

function node(
  id: string,
  name: string,
  extra: Partial<CatalogNode> = {},
): CatalogNode {
  return {
    children: [],
    color: "#F59E0B",
    icon: "cart",
    itemCount: 2,
    name,
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
    ...extra,
    id,
  };
}

const catalogQuery = new UseQueryFixture<CatalogQueryData>();
const financeQuery = new UseQueryFixture<CategoryDTO[]>();
const suggestCategories = new UseMutationFixture<unknown, void>();
const suggestLocations = new UseMutationFixture<unknown, void>();

const spies = {
  getCategories: jest.mocked(useCases.getStockCategoriesUseCase.execute),
  getFinance: jest.mocked(useCases.getFinancialCategoriesUseCase.execute),
  getLocations: jest.mocked(useCases.getStockLocationsUseCase.execute),
  invalidate: jest.mocked(invalidateFetcherData),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useOwnerScopedQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  catalogQuery.reset();
  financeQuery.reset();
  suggestCategories.reset();
  suggestLocations.reset();
  spies.isFocused.mockReturnValue(false);
  spies.useQuery.mockImplementation(((props: { cacheKey: string[] }) =>
    props.cacheKey.includes("catalog")
      ? catalogQuery.build()
      : financeQuery.build()) as never);
  spies.useMutation.mockImplementation(((props: { cacheKey: string[] }) =>
    props.cacheKey[0] === "suggest-categories"
      ? suggestCategories.build()
      : suggestLocations.build()) as never);
});

function givenData(
  categories: CatalogNode[],
  locations: CatalogNode[] = [],
  withOwners: OwnerDTO[] = owners,
) {
  catalogQuery.withData({ categories, locations, owners: withOwners });
}

function setup() {
  return renderHook(() => useStockCatalogScreenViewModel());
}

export {
  catalogQuery,
  financeQuery,
  givenData,
  node,
  owners,
  setup,
  spies,
  suggestCategories,
  suggestLocations,
};
