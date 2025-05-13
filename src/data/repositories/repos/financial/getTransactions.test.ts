import TransactionEntity, {
  TransactionOwners,
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/getTransactions.mocks";

it("SHOULD NOT call cache.set and datasource if has cached data", async () => {
  spies.cache.get.mockReturnValue([mocks.firstTransaction.toJSON()]);

  await setup();

  expect(spies.cache.set).not.toHaveBeenCalled();
  expect(
    spies.financialTransactionDatasource.getTransactions,
  ).not.toHaveBeenCalled();
});

it("SHOULD return transactions from cache", async () => {
  spies.cache.get.mockReturnValue([mocks.firstTransaction.toJSON()]);

  const result = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
  expect(result).toEqual([
    new TransactionEntity({
      category: mocks.firstTransaction.category,
      date: mocks.firstTransaction.date,
      description: mocks.firstTransaction.description,
      id: mocks.firstTransaction.id,
      owner: TransactionOwners[mocks.firstTransaction.owner],
      ownerId: mocks.firstTransaction.ownerId,
      type: TransactionType[mocks.firstTransaction.type],
      value: mocks.firstTransaction.value,
    }),
  ]);
});

it("SHOULD call cache.set and datasource if has no cached data", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.financialTransactionDatasource.getTransactions.mockResolvedValueOnce([
    mocks.firstTransaction,
    mocks.secondTransaction,
  ]);

  await setup();

  expect(spies.cache.set).toHaveBeenCalledTimes(1);
  expect(spies.cache.set).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
    [mocks.firstTransaction.toJSON(), mocks.secondTransaction.toJSON()],
  );
  expect(
    spies.financialTransactionDatasource.getTransactions,
  ).toHaveBeenCalledTimes(1);
  expect(
    spies.financialTransactionDatasource.getTransactions,
  ).toHaveBeenCalledWith(mocks.defaultParams);
});

it("SHOULD return transactions from datasource", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.financialTransactionDatasource.getTransactions.mockResolvedValueOnce([
    mocks.secondTransaction,
  ]);

  const result = await setup();

  expect(result).toEqual([
    new TransactionEntity({
      category: mocks.secondTransaction.category,
      date: mocks.secondTransaction.date,
      description: mocks.secondTransaction.description,
      id: mocks.secondTransaction.id,
      owner: TransactionOwners[mocks.secondTransaction.owner],
      ownerId: mocks.secondTransaction.ownerId,
      type: TransactionType[mocks.secondTransaction.type],
      value: mocks.secondTransaction.value,
    }),
  ]);
});
