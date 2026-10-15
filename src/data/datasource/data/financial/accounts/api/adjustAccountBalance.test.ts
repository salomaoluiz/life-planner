import {
  AccountArchived,
  ApiBusinessError,
  FinancialNotFound,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/adjustAccountBalance.mocks";

it("SHOULD POST the desired balance in cents with the device's today", async () => {
  spies.post.mockResolvedValueOnce({});

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.post).toHaveBeenCalledWith(
    `/v1/finance/accounts/${mocks.params.id}/balance-adjustment?today=2026-10-15`,
    { balance: 120000 },
  );
});

it("SHOULD send a negative balance in cents without float drift", async () => {
  spies.post.mockResolvedValueOnce({});

  await setup({ balance: -50.1 });

  expect(spies.post).toHaveBeenCalledWith(expect.any(String), {
    balance: -5010,
  });
});

it("SHOULD map a 422 to AccountArchived AND a 404 to FinancialNotFound", async () => {
  spies.post.mockRejectedValueOnce(new ApiBusinessError("Unprocessable", 422));
  expect(await setupThrowable()).toBeInstanceOf(AccountArchived);

  spies.post.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));
  expect(await setupThrowable()).toBeInstanceOf(FinancialNotFound);
});

it("SHOULD wrap unknown errors in GenericError with the account id only (never the balance)", async () => {
  spies.post.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "AccountDatasource - adjustAccountBalance",
    error: expect.any(Error),
    id: mocks.params.id,
  });
});
