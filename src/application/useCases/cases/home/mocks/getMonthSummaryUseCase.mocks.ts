import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import TransactionEntityFixture from "@domain/entities/financial/mocks/TransactionEntity.fixture";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";

import getMonthSummaryUseCase, {
  GetMonthSummaryUseCaseParams,
} from "../getMonthSummaryUseCase";

// region mocks

const october = new Date(2026, 9, 15);

const defaultParams: GetMonthSummaryUseCaseParams = {
  month: october,
  ownerIds: [
    "a02fc555-758a-419b-bfa9-b27799db926d",
    "e3ff764d-c31f-4739-8f25-9f31ab8b7a8b",
  ],
};

function transaction(date: Date, value: string, type: TransactionType) {
  return new TransactionEntityFixture()
    .withDefault()
    .withDate(date)
    .withType(type)
    .withValue(value)
    .build();
}

const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({ any_context: "any_value" });

// endregion mocks

// region spies

const transactionRepositorySpy = jest.mocked(
  repositoriesMocks.financialRepository.transaction,
);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  transactionRepositorySpy.getTransactions.mockResolvedValue([]);
});

async function setup(params: GetMonthSummaryUseCaseParams = defaultParams) {
  return getMonthSummaryUseCase(repositoriesMocks).execute(params);
}

async function setupThrowable(
  params: GetMonthSummaryUseCaseParams = defaultParams,
) {
  try {
    await setup(params);
  } catch (error) {
    return error;
  }
}

const spies = { transactionRepository: transactionRepositorySpy };

const mocks = {
  defaultParams,
  errors: { business: businessError, unknown: unknownError },
  october,
  transaction,
};

export { mocks, setup, setupThrowable, spies };
