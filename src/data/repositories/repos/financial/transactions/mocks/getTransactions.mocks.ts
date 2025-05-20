import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache from "@infrastructure/cache";

import getTransactions, { Params } from "../getTransactions";

// region mocks
const defaultParams: Params = [
  "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
  "a396f583-b8a5-4542-bd1a-81aa45c6fca4",
];

const firstTransaction = new TransactionModel({
  category: "Food",
  date: new Date().toISOString(),
  description: "Groceries",
  id: "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
  owner: OwnerType.FAMILY,
  ownerId: "88bdbf72-3558-4bd3-864e-c5e72786f5c3",
  type: TransactionType.EXPENSE,
  value: "100.0",
});

const secondTransaction = new TransactionModel({
  category: "Food",
  date: new Date().toISOString(),
  description: "Groceries",
  id: "a396f583-b8a5-4542-bd1a-81aa45c6fca4",
  owner: OwnerType.FAMILY,
  ownerId: "6bad0c6f-9329-4e64-b9be-ed15044badcf",
  type: TransactionType.EXPENSE,
  value: "150.0",
});

// endregion mocks

// region spies

const getCacheSpy = jest.spyOn(cache, "get");
const setCacheSpy = jest.spyOn(cache, "set");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Params) {
  return getTransactions(params ?? defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    get: getCacheSpy,
    set: setCacheSpy,
  },
  financialTransactionDatasource: jest.mocked(
    datasourcesMocks.financialTransactionDatasource,
  ),
};

const mocks = {
  defaultParams,
  firstTransaction,
  secondTransaction,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
