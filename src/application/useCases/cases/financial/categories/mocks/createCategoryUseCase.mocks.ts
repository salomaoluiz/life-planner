import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import createCategoryUseCase, {
  CreateCategoryUseCaseParams,
} from "../createCategoryUseCase";

// region mocks
const defaultParams: CreateCategoryUseCaseParams = {
  depthLevel: 0,
  icon: "icon",
  name: "Some name",
  owner: "USER",
  ownerId: "ownerId",
  parentId: "parentId",
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

async function setup(params?: Partial<CreateCategoryUseCaseParams>) {
  return createCategoryUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params?: Partial<CreateCategoryUseCaseParams>) {
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
