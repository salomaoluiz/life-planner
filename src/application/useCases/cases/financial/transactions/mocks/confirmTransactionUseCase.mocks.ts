import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import confirmTransactionUseCase, {
  ConfirmTransactionUseCaseParams,
} from "../confirmTransactionUseCase";

// region mocks
const defaultParams: ConfirmTransactionUseCaseParams = {
  date: "2026-10-24T00:00:00.000Z",
  id: "c9043ef0-09be-4ecd-aa27-d58a4a37f3a7",
  ownerId: "bbd28660-fa69-402e-9e81-a15be65d70fc",
  value: "99.90",
};
const businessError = new BusinessError();
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<ConfirmTransactionUseCaseParams>) {
  return confirmTransactionUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable() {
  try {
    await setup();
  } catch (err) {
    return err;
  }
}

const spies = {
  financialRepositoryTransaction: jest.mocked(
    repositoriesMocks.financialRepository.transaction,
  ),
};
const mocks = { defaultParams, errors: { business: businessError } };

export { mocks, setup, setupThrowable, spies };
