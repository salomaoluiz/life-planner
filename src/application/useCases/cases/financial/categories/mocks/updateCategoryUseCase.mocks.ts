import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import updateCategoryUseCase, {
  UpdateCategoryUseCaseParams,
} from "../updateCategoryUseCase";

// region mocks
const defaultParams: UpdateCategoryUseCaseParams = {
  depthLevel: 0,
  icon: "icon",
  id: "3002aee2-d4bb-4a5b-9888-16d872edecda",
  name: "Some name",
  owner: "USER",
  ownerId: "a02fc555-758a-419b-bfa9-b27799db926d",
  parentId: "7725d480-faff-4139-a62b-b69c3702aed2",
};

const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_value",
});

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<UpdateCategoryUseCaseParams>) {
  return updateCategoryUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params?: Partial<UpdateCategoryUseCaseParams>) {
  try {
    await setup(params);
  } catch (err) {
    return err;
  }
}

const spies = {
  financialRepositoryCategory: jest.mocked(
    repositoriesMocks.financialRepository.categories,
  ),
};

const mocks = {
  defaultParams,
  errors: {
    business: businessError,
    unknown: unknownError,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
