import { repositoriesMocks } from "@data/repositories/mocks";
import { BusinessError } from "@domain/entities/errors";

import deleteTransactionUseCase, {
  DeleteTransactionUseCaseParams,
} from "../deleteTransactionUseCase";

// region mocks
const defaultParams: DeleteTransactionUseCaseParams = {
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

async function setup(params?: Partial<DeleteTransactionUseCaseParams>) {
  return deleteTransactionUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(
  params?: Partial<DeleteTransactionUseCaseParams>,
) {
  try {
    await setup(params);
  } catch (err) {
    return err;
  }
}

const spies = {
  financialRepositoryTransaction: jest.mocked(
    repositoriesMocks.financialRepository.transaction,
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
