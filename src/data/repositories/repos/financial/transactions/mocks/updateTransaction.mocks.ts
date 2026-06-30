import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache from "@infrastructure/cache";

import updateTransaction, { Params } from "../updateTransaction";

// region mocks
const defaultParams: Params = {
  accountId: "c5598687-dfeb-485e-990a-a035d8e7d23d",
  category: "Food",
  categoryId: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
  date: new Date().toISOString(),
  description: "Groceries",
  id: "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
  owner: OwnerType.FAMILY,
  ownerId: "88bdbf72-3558-4bd3-864e-c5e72786f5c3",
  type: TransactionType.EXPENSE,
  value: "100.0",
};

// endregion mocks

// region spies
const invalidateCacheSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return updateTransaction({ ...defaultParams, ...params }, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  financialTransactionDatasource: jest.mocked(
    datasourcesMocks.financialTransactionDatasource,
  ),
};

const mocks = {
  defaultParams,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
