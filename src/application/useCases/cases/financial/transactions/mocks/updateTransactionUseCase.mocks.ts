import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import updateTransactionUseCase, {
  UpdateTransactionUseCaseParams,
} from "../updateTransactionUseCase";

// region mocks
const defaultParams: UpdateTransactionUseCaseParams = {
  accountId: "c5598687-dfeb-485e-990a-a035d8e7d23d",
  category: "Some category",
  categoryId: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
  date: new Date().toISOString(),
  description: "Some description",
  id: "ae229059-6b7d-450f-a113-835d21370322",
  owner: "FAMILY",
  ownerId: "4292904b-4705-49f9-86c1-dbabcbbebc7c",
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

async function setup(params?: Partial<UpdateTransactionUseCaseParams>) {
  return updateTransactionUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(
  params?: Partial<UpdateTransactionUseCaseParams>,
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
