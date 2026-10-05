import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { renderHook } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useCategoriesViewModel from "../useCategoriesViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "categories",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
  },
}));

// region mocks
const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Test Family", type: OwnerType.FAMILY }),
];

function cat(
  id: string,
  name: string,
  type: string,
  ownerId = "user-id",
  parentId?: string,
) {
  return new CategoryDTO({
    icon: "food",
    iconColor: "#F59E0B",
    id,
    name,
    owner: ownerId === "user-id" ? "USER" : "FAMILY",
    ownerId,
    parentId,
    type,
  });
}

const categoriesQuery = new UseQueryFixture<{
  categories: CategoryDTO[];
  owners: OwnerDTO[];
}>();
// endregion mocks

// region spies
const spies = {
  getCategories: jest.mocked(useCases.getFinancialCategoriesUseCase.execute),
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  categoriesQuery.reset();
  spies.isFocused.mockReturnValue(false);
  spies.useQuery.mockImplementation((() => categoriesQuery.build()) as never);
});

function givenData(categories: CategoryDTO[]) {
  categoriesQuery.withData({ categories, owners });
}

function setup() {
  return renderHook(() => useCategoriesViewModel());
}

export { cat, categoriesQuery, givenData, owners, setup, spies };
