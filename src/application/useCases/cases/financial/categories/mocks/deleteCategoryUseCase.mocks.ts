import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

import deleteCategoryUseCase, {
  DeleteCategoryUseCaseParams,
} from "../deleteCategoryUseCase";

const defaultParams: DeleteCategoryUseCaseParams = {
  id: "cat-uuid",
  ownerId: "user-id",
};

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<DeleteCategoryUseCaseParams>) {
  return deleteCategoryUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

const spies = {
  financialRepositoryCategory: jest.mocked(
    repositoriesMocks.financialRepository.category,
  ),
};

const mocks = {
  defaultParams,
};

export { mocks, setup, spies };
