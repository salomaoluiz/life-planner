import { repositoriesMocks } from "@data/repositories/mocks";
import { BusinessError } from "@domain/entities/errors";
import TransactionEntityFixture from "@domain/entities/financial/mocks/TransactionEntity.fixture";

import getTransactionsUseCase, {
  GetTransactionsUseCaseParams,
} from "../getTransactionsUseCase";

// region mocks
const defaultParams: GetTransactionsUseCaseParams = {
  ownerIds: [
    "a02fc555-758a-419b-bfa9-b27799db926d",
    "e3ff764d-c31f-4739-8f25-9f31ab8b7a8b",
  ],
};

const transactionEntityFixture = new TransactionEntityFixture().withDefault();

const transactionEntitiesMock = [
  transactionEntityFixture
    .withId("7725d480-faff-4139-a62b-b69c3702aed2")
    .build(),
  transactionEntityFixture
    .withId("7725d480-faff-4139-a62b-b69c3702aed2")
    .build(),
];

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

async function setup(params?: Partial<GetTransactionsUseCaseParams>) {
  return getTransactionsUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params?: Partial<GetTransactionsUseCaseParams>) {
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
  transactionEntities: transactionEntitiesMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
