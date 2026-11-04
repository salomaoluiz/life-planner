import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { BusinessError } from "@domain/entities/errors";
import { recentTransactionsRange } from "@domain/entities/financial/TransactionQueryFilter";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getTransactionsUseCase.mocks";

const getTransactionsSpy = spies.financialRepositoryTransaction.getTransactions;
const getCategoriesSpy = spies.financialRepositoryCategory.getCategories;
const getAccountsSpy = spies.financialRepositoryAccount.getAccounts;

it("SHOULD get all transactions and return the TransactionDTO", async () => {
  getTransactionsSpy.mockResolvedValueOnce(mocks.transactionEntities);
  getCategoriesSpy.mockResolvedValueOnce(mocks.categories);
  getAccountsSpy.mockResolvedValueOnce(mocks.accounts);

  const result = await setup();

  expect(getTransactionsSpy).toHaveBeenCalledTimes(1);
  // Spec 078: without a range, the recent 24-month window (never the whole history).
  expect(getTransactionsSpy).toHaveBeenCalledWith(
    mocks.defaultParams.ownerIds,
    recentTransactionsRange(new Date()),
  );
  expect(getCategoriesSpy).toHaveBeenCalledTimes(1);
  expect(getCategoriesSpy).toHaveBeenCalledWith(mocks.defaultParams.ownerIds);
  expect(getAccountsSpy).toHaveBeenCalledTimes(1);
  expect(getAccountsSpy).toHaveBeenCalledWith(mocks.defaultParams.ownerIds);

  const expected = mocks.transactionEntities.map((transaction) => {
    const category = mocks.categories.find(
      (c) => c.id === transaction.categoryId,
    );
    const account = mocks.accounts.find((a) => a.id === transaction.accountId);
    return TransactionDTO.fromEntity(
      transaction,
      category?.name,
      account?.name,
    );
  });
  expect(result).toEqual(expected);
});

it("SHOULD throw if the repository throws", async () => {
  getTransactionsSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  getTransactionsSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "financial.getTransactionsUseCase",
  });
});

it("SHOULD ask the repository only for the period WHEN a range is given", async () => {
  const range = { from: "2026-10-01", to: "2026-10-31" };
  spies.financialRepositoryTransaction.getTransactions.mockResolvedValueOnce(
    [],
  );
  spies.financialRepositoryCategory.getCategories.mockResolvedValueOnce([]);
  spies.financialRepositoryAccount.getAccounts.mockResolvedValueOnce([]);

  await setup({ range });

  expect(
    spies.financialRepositoryTransaction.getTransactions,
  ).toHaveBeenCalledWith(mocks.defaultParams.ownerIds, range);
});

it("SHOULD pass the given range through", async () => {
  getTransactionsSpy.mockResolvedValueOnce([]);
  getCategoriesSpy.mockResolvedValueOnce([]);
  getAccountsSpy.mockResolvedValueOnce([]);
  const range = { from: "2026-10-01", to: "2026-10-31" };

  await setup({ ...mocks.defaultParams, range });

  expect(getTransactionsSpy).toHaveBeenCalledWith(
    mocks.defaultParams.ownerIds,
    range,
  );
});
