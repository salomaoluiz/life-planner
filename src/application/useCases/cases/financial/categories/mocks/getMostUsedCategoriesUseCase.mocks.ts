import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import CategoryEntity, {
  CategoryType,
} from "@domain/entities/financial/CategoryEntity";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import getMostUsedCategoriesUseCase, {
  GetMostUsedCategoriesUseCaseParams,
} from "../getMostUsedCategoriesUseCase";

// region mocks
const now = new Date(2026, 9, 5, 12, 0, 0);

function daysAgo(days: number) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
}

function makeCategory(id: string, name: string, overrides = {}) {
  return new CategoryEntity({
    icon: "folder",
    id,
    name,
    owner: OwnerType.USER,
    ownerId: "user-id",
    type: CategoryType.EXPENSE,
    ...overrides,
  });
}

function makeTransaction(categoryId: string, date: Date, overrides = {}) {
  return new TransactionEntity({
    accountId: "account-id",
    category: "name",
    categoryId,
    date: date.toISOString(),
    description: "description",
    id: `${categoryId}-${date.getTime()}`,
    owner: OwnerType.USER,
    ownerId: "user-id",
    type: TransactionType.EXPENSE,
    value: "10.00",
    ...overrides,
  });
}

const businessError = new BusinessError();
const unknownError = new Error("Some error");
// endregion mocks

// region spies
const spies = {
  categories: jest.mocked(repositoriesMocks.financialRepository.category),
  transactions: jest.mocked(repositoriesMocks.financialRepository.transaction),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<GetMostUsedCategoriesUseCaseParams>) {
  return getMostUsedCategoriesUseCase(repositoriesMocks).execute({
    now,
    ownerId: "user-id",
    type: "EXPENSE",
    ...params,
  });
}

async function setupThrowable(
  params?: Partial<GetMostUsedCategoriesUseCaseParams>,
) {
  try {
    await setup(params);
  } catch (err) {
    return err;
  }
}

const mocks = {
  businessError,
  daysAgo,
  makeCategory,
  makeTransaction,
  unknownError,
};

export { mocks, setup, setupThrowable, spies };
