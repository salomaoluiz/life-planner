import {
  ApiBusinessError,
  FieldInvalid,
  FinancialNotFound,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateTransaction.mocks";

it("SHOULD PATCH /v1/finance/transactions/:id with converted value / date (transactions MAY send owner and ownerId; never the category name or id)", async () => {
  spies.patch.mockResolvedValueOnce({});

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.patch).toHaveBeenCalledWith(
    `/v1/finance/transactions/${mocks.id}`,
    {
      accountId: mocks.params.accountId,
      categoryId: mocks.params.categoryId,
      date: "2026-10-03",
      description: "Weekly groceries",
      owner: "USER",
      ownerId: mocks.params.ownerId,
      type: "EXPENSE",
      value: 23490,
    },
  );
});

it("SHOULD send only the fields that are defined", async () => {
  spies.patch.mockResolvedValueOnce({});

  await setup({ ...mocks.onlyId, description: "Renamed" });

  const [, body] = spies.patch.mock.calls[0];
  expect(JSON.parse(JSON.stringify(body))).toEqual({ description: "Renamed" });
});

it("SHOULD skip the request WHEN there is nothing to update (the category name alone is not a field)", async () => {
  await setup({ ...mocks.onlyId, category: "Only the name" });

  expect(spies.patch).not.toHaveBeenCalled();
});

it("SHOULD throw FieldInvalid WITHOUT calling the API for an invalid value", async () => {
  expect(await setupThrowable({ value: "abc" })).toBeInstanceOf(FieldInvalid);
  expect(spies.patch).not.toHaveBeenCalled();
});

it("SHOULD map a 404 to FinancialNotFound", async () => {
  spies.patch.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

  expect(await setupThrowable()).toBeInstanceOf(FinancialNotFound);
});

it("SHOULD wrap unknown errors in GenericError with the transaction id only", async () => {
  spies.patch.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - updateTransaction",
    error: expect.any(Error),
    id: mocks.id,
  });
});
