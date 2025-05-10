import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getTransactionsUseCase.mocks";

const getTransactionsSpy = spies.financialRepositoryTransaction.getTransactions;

it("SHOULD get all transactions and return the TransactionDTO", async () => {
  getTransactionsSpy.mockResolvedValueOnce(mocks.transactionEntities);

  const result = await setup();

  expect(getTransactionsSpy).toHaveBeenCalledTimes(1);
  expect(getTransactionsSpy).toHaveBeenCalledWith(mocks.defaultParams.ownerIds);
  const expected = mocks.transactionEntities.map((transaction) =>
    TransactionDTO.fromEntity(transaction),
  );
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
