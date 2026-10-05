import {
  ApiBusinessError,
  ConnectivityError,
  FinancialNotFound,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteTransaction.mocks";

it("SHOULD DELETE /v1/finance/transactions/:id (204, empty body)", async () => {
  spies.delete.mockResolvedValueOnce(undefined);

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.delete).toHaveBeenCalledWith(
    `/v1/finance/transactions/${mocks.params.id}`,
  );
});

it("SHOULD throw FinancialNotFound WHEN the API answers 404", async () => {
  spies.delete.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

  expect(await setupThrowable()).toBeInstanceOf(FinancialNotFound);
});

it("SHOULD re-throw other business errors", async () => {
  const error = new ConnectivityError();
  spies.delete.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the transaction id only", async () => {
  spies.delete.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - deleteTransaction",
    error: expect.any(Error),
    id: mocks.params.id,
  });
});
