import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/createTransaction.mocks";

it("SHOULD create a transaction", async () => {
  await setup();

  expect(
    spies.financialTransactionDatasource.createTransaction,
  ).toHaveBeenCalledWith({
    accountId: mocks.defaultParams.accountId,
    category: mocks.defaultParams.category,
    categoryId: mocks.defaultParams.categoryId,
    date: mocks.defaultParams.date,
    description: mocks.defaultParams.description,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    type: mocks.defaultParams.type,
    value: mocks.defaultParams.value,
  });
});

it("SHOULD return a transaction created", async () => {
  const result = await setup();

  expect(result).toEqual(
    new TransactionEntity({
      accountId: mocks.transactionModel.accountId,
      category: mocks.transactionModel.category,
      categoryId: mocks.transactionModel.categoryId,
      date: mocks.transactionModel.date,
      description: mocks.transactionModel.description,
      id: mocks.transactionModel.id,
      owner: OwnerType[mocks.transactionModel.owner],
      ownerId: mocks.transactionModel.ownerId,
      type: TransactionType[mocks.transactionModel.type],
      value: mocks.transactionModel.value,
    }),
  );
});

it("SHOULD invalidate cache after transaction created", async () => {
  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
});
