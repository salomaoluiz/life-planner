import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache from "@infrastructure/cache";

import createTransaction, { Params } from "../createTransaction";

// region mocks
const defaultParams: Params = {
  accountId: "c5598687-dfeb-485e-990a-a035d8e7d23d",
  category: "Some Category",
  categoryId: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
  date: new Date().toISOString(),
  description: "Some Description",
  owner: OwnerType.FAMILY,
  ownerId: "1dcc732e-8886-4a68-b669-ded3f3809c20",
  type: TransactionType.EXPENSE,
  value: "100.0",
};

const transactionModelMock = new TransactionModel({
  accountId: "c5598687-dfeb-485e-990a-a035d8e7d23d",
  category: "Some Category",
  categoryId: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
  date: new Date().toISOString(),
  description: "Some Description",
  id: "1dcc732e-8886-4a68-b669-ded3f3809c20",
  owner: OwnerType.FAMILY,
  ownerId: "1dcc732e-8886-4a68-b669-ded3f3809c20",
  type: TransactionType.EXPENSE,
  value: "100.0",
});

// endregion mocks

// region spies
const financialTransactionDatasourceSpy = jest.mocked(
  datasourcesMocks.financialTransactionDatasource,
);
financialTransactionDatasourceSpy.createTransaction.mockResolvedValue(
  transactionModelMock,
);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return createTransaction({ ...defaultParams, ...params }, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  financialTransactionDatasource: financialTransactionDatasourceSpy,
};

const mocks = {
  defaultParams,
  transactionModel: transactionModelMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
