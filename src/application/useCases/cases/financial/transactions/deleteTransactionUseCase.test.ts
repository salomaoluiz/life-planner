import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteTransactionUseCase.mocks";

const deleteTransactionSpy =
  spies.financialRepositoryTransaction.deleteTransaction;

it("SHOULD delete a transaction", () => {
  setup();

  expect(deleteTransactionSpy).toHaveBeenCalledTimes(1);
  expect(deleteTransactionSpy).toHaveBeenCalledWith({
    id: mocks.defaultParams.id,
    ownerId: mocks.defaultParams.ownerId,
  });
});

it("SHOULD throw if the repository throws", async () => {
  deleteTransactionSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  deleteTransactionSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "financial.deleteTransactionUseCase",
  });
});
