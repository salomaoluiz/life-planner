import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

import hasCategoryTransactionsUseCase, {
  HasCategoryTransactionsUseCaseParams,
} from "../hasCategoryTransactionsUseCase";

const params: HasCategoryTransactionsUseCaseParams = {
  categoryId: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
  ownerIds: ["a02fc555-758a-419b-bfa9-b27799db926d"],
};

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return hasCategoryTransactionsUseCase(repositoriesMocks).execute(params);
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

const mocks = { params };

export { mocks, setup, setupThrowable, spies };
