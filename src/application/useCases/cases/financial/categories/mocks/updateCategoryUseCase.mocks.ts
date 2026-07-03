import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import updateCategoryUseCase, {
  UpdateCategoryUseCaseParams,
} from "../updateCategoryUseCase";

const defaultParams: UpdateCategoryUseCaseParams = {
  depthLevel: 1,
  icon: "icon-new",
  id: "cat-uuid",
  name: "Category New",
  owner: "FAMILY",
  ownerId: "user-id",
  parentId: "parent-uuid",
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
