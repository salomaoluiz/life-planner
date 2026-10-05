import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import CategoryEntityFixture from "@domain/entities/financial/mocks/CategoryEntity.fixture";
import TransactionEntityFixture from "@domain/entities/financial/mocks/TransactionEntity.fixture";

import getRecentTransactionsUseCase, {
  GetRecentTransactionsUseCaseParams,
} from "../getRecentTransactionsUseCase";

// region mocks

const ownerIds = ["a02fc555-758a-419b-bfa9-b27799db926d"];
const categoryId = "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f";

const category = new CategoryEntityFixture()
  .withDefault()
  .withId(categoryId)
  .withName("Groceries")
  .withIcon("cart")
  .withIconColor("#2E7D32")
  .build();

function transaction(id: string, date: Date, value = "10.00") {
  return new TransactionEntityFixture()
    .withDefault()
    .withId(id)
    .withDate(date)
    .withValue(value)
    .withCategoryId(categoryId)
    .withCategory("Groceries")
    .build();
}

const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({ any_context: "any_value" });

// endregion mocks

// region spies

const financialSpy = jest.mocked(repositoriesMocks.financialRepository);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  financialSpy.transaction.getTransactions.mockResolvedValue([]);
  financialSpy.category.getCategories.mockResolvedValue([category]);
});

async function setup(params: Partial<GetRecentTransactionsUseCaseParams> = {}) {
  return getRecentTransactionsUseCase(repositoriesMocks).execute({
    ownerIds,
    ...params,
  });
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { financialRepository: financialSpy };

const mocks = {
  category,
  errors: { business: businessError, unknown: unknownError },
  ownerIds,
  transaction,
};

export { mocks, setup, setupThrowable, spies };
