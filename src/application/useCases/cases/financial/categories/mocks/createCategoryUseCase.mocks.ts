import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import createCategoryUseCase, {
  CreateCategoryUseCaseParams,
} from "../createCategoryUseCase";

const defaultParams: CreateCategoryUseCaseParams = {
  depthLevel: 0,
  icon: "icon",
  iconColor: "black",
  name: "Category",
  owner: "FAMILY",
  ownerId: "user-id",
  parentId: undefined,
  type: "EXPENSE",
};

const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_value",
});

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
    repositoriesMocks.financialRepository.category,
  ),
};

const mocks = {
  defaultParams,
  errors: {
    business: businessError,
    unknown: unknownError,
  },
};

export { mocks, setup, setupThrowable, spies };
