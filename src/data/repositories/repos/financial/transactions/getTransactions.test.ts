import TransactionModel from "@data/models/financial/TransactionModel";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { mocks, setup, spies } from "./mocks/getTransactions.mocks";

it("SHOULD read the period straight from the datasource (spec 078: a period is always asked)", async () => {
  spies.financialTransactionDatasource.getTransactions.mockResolvedValueOnce([
    mocks.secondTransaction,
  ]);

  const result = await setup();

  expect(
    spies.financialTransactionDatasource.getTransactions,
  ).toHaveBeenCalledWith(mocks.defaultParams, mocks.defaultRange);
  expect(result).toEqual([
    new TransactionEntity({
      accountId: mocks.secondTransaction.accountId,
      category: mocks.secondTransaction.category,
      categoryId: mocks.secondTransaction.categoryId,
      date: mocks.secondTransaction.date,
      description: mocks.secondTransaction.description,
      id: mocks.secondTransaction.id,
      owner: OwnerType[mocks.secondTransaction.owner],
      ownerId: mocks.secondTransaction.ownerId,
      type: TransactionType[mocks.secondTransaction.type],
      value: mocks.secondTransaction.value,
    }),
  ]);
});

it("SHOULD keep the system category key and excludeFromTotals from the model", async () => {
  const adjustment = new TransactionModel({
    ...mocks.firstTransaction,
    excludeFromTotals: true,
    systemKey: "BALANCE_ADJUSTMENT",
  });
  spies.financialTransactionDatasource.getTransactions.mockResolvedValueOnce([
    adjustment,
  ]);

  const [result] = await setup();

  expect(result.systemKey).toBe("BALANCE_ADJUSTMENT");
  expect(result.excludeFromTotals).toBe(true);
});

it("SHOULD return an empty list WHEN the period has no transactions", async () => {
  spies.financialTransactionDatasource.getTransactions.mockResolvedValueOnce(
    [],
  );

  expect(await setup()).toEqual([]);
});
