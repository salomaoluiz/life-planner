import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import AccountEntity, {
  AccountStatus,
} from "@domain/entities/financial/AccountEntity";
import CategoryEntity, {
  CategoryType,
} from "@domain/entities/financial/CategoryEntity";
import DailyBalanceEntity from "@domain/entities/financial/DailyBalanceEntity";
import FinanceMonthEntity from "@domain/entities/financial/FinanceMonthEntity";
import TransactionEntityFixture from "@domain/entities/financial/mocks/TransactionEntity.fixture";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import getFinanceMonthUseCase, {
  GetFinanceMonthUseCaseParams,
} from "../getFinanceMonthUseCase";

// region mocks
const transaction = new TransactionEntityFixture()
  .withDefault()
  .withId("7725d480-faff-4139-a62b-b69c3702aed2")
  .build();

const params: GetFinanceMonthUseCaseParams = {
  month: "2026-11",
  ownerIds: ["a02fc555-758a-419b-bfa9-b27799db926d"],
};

const month: FinanceMonthEntity = {
  dailyBalances: new DailyBalanceEntity({
    accounts: [],
    days: [],
    month: "2026-11",
  }),
  invoices: [],
  projections: [],
  summary: {
    expense: 100,
    income: 300,
    projectedExpense: 0,
    projectedIncome: 0,
    toPay: 50,
    toReceive: 0,
  },
  transactions: [transaction],
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
  return getFinanceMonthUseCase(repositoriesMocks).execute(params);
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

const mocks = { accounts, categories, month, params, transaction };

export { mocks, setup, setupThrowable, spies };
