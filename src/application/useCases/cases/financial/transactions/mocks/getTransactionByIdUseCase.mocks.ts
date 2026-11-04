import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import AccountEntity, {
  AccountStatus,
} from "@domain/entities/financial/AccountEntity";
import CategoryEntity, {
  CategoryType,
} from "@domain/entities/financial/CategoryEntity";
import TransactionEntityFixture from "@domain/entities/financial/mocks/TransactionEntity.fixture";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import getTransactionByIdUseCase, {
  GetTransactionByIdUseCaseParams,
} from "../getTransactionByIdUseCase";

// region mocks
const transaction = new TransactionEntityFixture()
  .withDefault()
  .withId("7725d480-faff-4139-a62b-b69c3702aed2")
  .build();

const params: GetTransactionByIdUseCaseParams = {
  id: transaction.id,
  ownerIds: ["a02fc555-758a-419b-bfa9-b27799db926d"],
};

const categories = [
  new CategoryEntity({
    icon: "cart",
    id: transaction.categoryId,
    name: "Shopping",
    owner: OwnerType.FAMILY,
    ownerId: "b11923e6-bfbb-4965-b3f6-a075249d1e63",
    type: CategoryType.EXPENSE,
  }),
];

const accounts = [
  new AccountEntity({
    balance: 1000,
    icon: "bank",
    id: transaction.accountId as string,
    name: "Main Account",
    owner: OwnerType.FAMILY,
    ownerId: "b11923e6-bfbb-4965-b3f6-a075249d1e63",
    status: AccountStatus.ACTIVE,
  }),
];
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getTransactionByIdUseCase(repositoriesMocks).execute(params);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (err) {
    return err;
  }
}

const spies = {
  financialRepositoryAccount: jest.mocked(
    repositoriesMocks.financialRepository.account,
  ),
  financialRepositoryCategory: jest.mocked(
    repositoriesMocks.financialRepository.category,
  ),
  financialRepositoryTransaction: jest.mocked(
    repositoriesMocks.financialRepository.transaction,
  ),
};

const mocks = { accounts, categories, params, transaction };

export { mocks, setup, setupThrowable, spies };
