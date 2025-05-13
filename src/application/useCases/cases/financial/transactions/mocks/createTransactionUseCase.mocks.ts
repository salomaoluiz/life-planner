import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import createTransactionUseCase, {
  CreateTransactionUseCaseParams,
} from "../createTransactionUseCase";

// region mocks
const defaultParams: CreateTransactionUseCaseParams = {
  category: "Some Category",
  date: new Date().toISOString(),
  description: "Some Transaction Description",
  owner: "FAMILY",
  ownerId: "0cb04647-5f98-4a39-8ae0-e11eb7f29113",
  type: "EXPENSE",
  value: "100.00",
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

async function setup(params?: Partial<CreateTransactionUseCaseParams>) {
  return createTransactionUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(
  params?: Partial<CreateTransactionUseCaseParams>,
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
