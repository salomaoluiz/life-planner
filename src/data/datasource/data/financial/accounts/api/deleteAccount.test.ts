import {
  AccountHasTransactions,
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
} from "./mocks/deleteAccount.mocks";

it("SHOULD DELETE /v1/finance/accounts/:id (204, empty body)", async () => {
  spies.delete.mockResolvedValueOnce(undefined);

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.delete).toHaveBeenCalledWith(
    `/v1/finance/accounts/${mocks.params.id}`,
  );
});

it("SHOULD throw AccountHasTransactions WHEN the API answers 409", async () => {
  spies.delete.mockRejectedValueOnce(
    new ApiBusinessError("Account has transactions", 409),
  );

  expect(await setupThrowable()).toBeInstanceOf(AccountHasTransactions);
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

it("SHOULD wrap unknown errors in GenericError with the account id only", async () => {
  spies.delete.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "AccountDatasource - deleteAccount",
    error: expect.any(Error),
    id: mocks.params.id,
  });
});
