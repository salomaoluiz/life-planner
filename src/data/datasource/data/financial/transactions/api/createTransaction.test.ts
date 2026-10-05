import TransactionModel from "@data/models/financial/TransactionModel";
import {
  ApiBusinessError,
  FieldInvalid,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createTransaction.mocks";

it("SHOULD POST /v1/finance/transactions with the value in cents AND the date as YYYY-MM-DD (the category name is NOT sent)", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiTransaction);

  const result = await setup();

  expect(spies.post).toHaveBeenCalledWith("/v1/finance/transactions", {
    accountId: mocks.params.accountId,
    categoryId: mocks.params.categoryId,
    date: "2026-10-03",
    description: "Weekly groceries",
    owner: "USER",
    ownerId: mocks.params.ownerId,
    type: "EXPENSE",
    value: 23490,
  });
  expect(result).toEqual(TransactionModel.fromJSON(mocks.apiTransaction));
});

it.each([
  ["234.90", 23490],
  ["234,90", 23490],
  ["234.9", 23490],
  ["0.29", 29],
])("SHOULD send %j as %i cents", async (value, cents) => {
  spies.post.mockResolvedValueOnce(mocks.apiTransaction);

  await setup({ value });

  expect(spies.post).toHaveBeenCalledWith(
    "/v1/finance/transactions",
    expect.objectContaining({ value: cents }),
  );
});

it.each(["", "abc", "-5", "1.234,56", "1e3"])(
  "SHOULD throw FieldInvalid WITHOUT calling the API for the value %j",
  async (value) => {
    expect(await setupThrowable({ value })).toBeInstanceOf(FieldInvalid);
    expect(spies.post).not.toHaveBeenCalled();
  },
);

it("SHOULD throw FieldInvalid WITHOUT calling the API for an invalid date", async () => {
  expect(await setupThrowable({ date: "not a date" })).toBeInstanceOf(
    FieldInvalid,
  );
  expect(spies.post).not.toHaveBeenCalled();
});

it("SHOULD map 400 to FieldInvalid, 403 to FinancialOwnerNotAllowed AND 404 (account / category not found) to FinancialNotFound", async () => {
  spies.post.mockRejectedValueOnce(
    new ApiBusinessError("Validation Failed", 400),
  );
  expect(await setupThrowable()).toBeInstanceOf(FieldInvalid);

  spies.post.mockRejectedValueOnce(
    new ApiBusinessError("Owner not accessible", 403),
  );
  expect(await setupThrowable()).toBeInstanceOf(FinancialOwnerNotAllowed);

  spies.post.mockRejectedValueOnce(
    new ApiBusinessError("Account not found", 404),
  );
  expect(await setupThrowable()).toBeInstanceOf(FinancialNotFound);
});

it("SHOULD wrap unknown errors in GenericError with the owner id only (no description, no amount)", async () => {
  spies.post.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "TransactionDatasource - createTransaction",
    error: expect.any(Error),
    ownerId: mocks.params.ownerId,
  });
});
