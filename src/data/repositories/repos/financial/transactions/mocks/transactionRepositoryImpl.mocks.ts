import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";

import * as createTransaction from "../createTransaction";
import * as deleteTransaction from "../deleteTransaction";
import * as getTransactions from "../getTransactions";
import transactionRepositoryImpl from "../transactionRepositoryImpl";
import * as updateTransaction from "../updateTransaction";

// region mocks

// endregion mocks

// region spies

const createTransactionSpy = jest.spyOn(createTransaction, "default");
createTransactionSpy.mockResolvedValue("createTransaction response" as never);

const deleteTransactionSpy = jest.spyOn(deleteTransaction, "default");
deleteTransactionSpy.mockResolvedValue("deleteTransaction response" as never);

const getTransactionsSpy = jest.spyOn(getTransactions, "default");
getTransactionsSpy.mockResolvedValue("getTransactions response" as never);

const updateTransactionSpy = jest.spyOn(updateTransaction, "default");
updateTransactionSpy.mockResolvedValue("updateTransaction response" as never);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return transactionRepositoryImpl(datasourcesMocks);
}

const spies = {
  createTransaction: createTransactionSpy,
  deleteTransaction: deleteTransactionSpy,
  getTransactions: getTransactionsSpy,
  updateTransaction: updateTransactionSpy,
};

const mocks = {
  datasources: datasourcesMocks,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
