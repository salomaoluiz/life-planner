import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import deleteCategoryUseCase, {
  DeleteCategoryUseCaseParams,
} from "../deleteCategoryUseCase";

// region mocks
const defaultParams: DeleteCategoryUseCaseParams = {
  id: "c9043ef0-09be-4ecd-aa27-d58a4a37f3a7",
  ownerId: "bbd28660-fa69-402e-9e81-a15be65d70fc",
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

async function setup(params?: Partial<DeleteCategoryUseCaseParams>) {
  return deleteCategoryUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params?: Partial<DeleteCategoryUseCaseParams>) {
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
