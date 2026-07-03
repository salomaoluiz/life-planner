import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import CategoryEntity, {
  CategoryType,
} from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import getCategoriesUseCase, {
  GetCategoriesUseCaseParams,
} from "../getCategoriesUseCase";

const defaultParams: GetCategoriesUseCaseParams = ["user-id"];

const categoryEntityMock = new CategoryEntity({
  depthLevel: 0,
  icon: "icon",
  id: "cat-uuid",
  name: "Category",
  owner: OwnerType.USER,
  ownerId: "user-id",
  parentId: undefined,
  type: CategoryType.EXPENSE,
});

const repositorySpy = jest.mocked(
  repositoriesMocks.financialRepository.category,
);
repositorySpy.getCategories.mockResolvedValue([categoryEntityMock]);

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: GetCategoriesUseCaseParams) {
  return getCategoriesUseCase(repositoriesMocks).execute(
    params ?? defaultParams,
  );
}

const spies = {
  financialRepositoryCategory: repositorySpy,
};

const mocks = {
  defaultParams,
};

export { mocks, setup, spies };
