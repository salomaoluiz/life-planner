import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { renderHook } from "@tests";

import TagDTO from "@application/dto/financial/TagDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";

import useTagsViewModel from "../useTagsViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialTagsUseCase: { execute: jest.fn(), uniqueName: "tags" },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
  },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Test Family", type: OwnerType.FAMILY }),
  new OwnerDTO({
    archived: true,
    id: "family-2",
    name: "Old Family",
    type: OwnerType.FAMILY,
  }),
];

function tag(name: string, scopeOwnerIds = ["user-id"], scope = "PERSONAL") {
  return new TagDTO({
    id: name,
    name,
    owner: "USER",
    ownerId: scopeOwnerIds[0],
    scope: scope as never,
    scopeOwnerIds,
    usageCount: 1,
  });
}

const tagsQuery = new UseQueryFixture<{ owners: OwnerDTO[]; tags: TagDTO[] }>();

const spies = {
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  getTags: jest.mocked(useCases.getFinancialTagsUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useQuery: jest.mocked(useOwnerScopedQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  spies.isFocused.mockReturnValue(false);
  tagsQuery.reset();
  spies.useQuery.mockReturnValue(tagsQuery.build() as never);
});

function givenData(tags: TagDTO[]) {
  tagsQuery.withData({ owners, tags });
  spies.useQuery.mockReturnValue(tagsQuery.build() as never);
}

function setup() {
  return renderHook(() => useTagsViewModel());
}

export { givenData, owners, setup, spies, tag, tagsQuery };
