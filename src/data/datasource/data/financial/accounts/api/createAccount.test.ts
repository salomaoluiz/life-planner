import AccountModel from "@data/models/financial/AccountModel";
import {
  ApiBusinessError,
  FieldInvalid,
  FinancialOwnerNotAllowed,
  GenericError,
} from "@domain/entities/errors";
import { AccountType } from "@domain/entities/financial/AccountEntity";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createAccount.mocks";

it("SHOULD POST /v1/finance/accounts with the balance in cents AND return the created AccountModel", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiAccount);

  const result = await setup();

  expect(spies.post).toHaveBeenCalledWith("/v1/finance/accounts", {
    icon: "bank",
    initialBalance: 152075,
    name: "Checking",
    owner: "USER",
    ownerId: mocks.params.ownerId,
    status: "ACTIVE",
  });
  expect(result).toEqual(AccountModel.fromJSON(mocks.apiAccount));
});

it("SHOULD send isFavorite WHEN the new account is marked as favorite (spec 094)", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiAccount);

  await setup({ isFavorite: true });

  expect(spies.post).toHaveBeenCalledWith(
    "/v1/finance/accounts",
    expect.objectContaining({ isFavorite: true }),
  );
});

it("SHOULD send the type WHEN one is chosen (spec 101)", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiAccount);

  await setup({ type: AccountType.BROKERAGE });

  expect(spies.post).toHaveBeenCalledWith(
    "/v1/finance/accounts",
    expect.objectContaining({ type: "BROKERAGE" }),
  );
});

it("SHOULD send the currency WHEN one is chosen (spec 103)", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiAccount);

  await setup({ currency: "USD" });

  expect(spies.post).toHaveBeenCalledWith(
    "/v1/finance/accounts",
    expect.objectContaining({ currency: "USD" }),
  );
});

it("SHOULD send a negative balance in cents", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiAccount);

  await setup({ balance: -50.5 });

  expect(spies.post).toHaveBeenCalledWith(
    "/v1/finance/accounts",
    expect.objectContaining({ initialBalance: -5050 }),
  );
});

it("SHOULD map a 400 to FieldInvalid AND a 403 to FinancialOwnerNotAllowed", async () => {
  spies.post.mockRejectedValueOnce(
    new ApiBusinessError("Validation Failed", 400),
  );
  expect(await setupThrowable()).toBeInstanceOf(FieldInvalid);

  spies.post.mockRejectedValueOnce(
    new ApiBusinessError("Owner not accessible", 403),
  );
  expect(await setupThrowable()).toBeInstanceOf(FinancialOwnerNotAllowed);
});

it("SHOULD wrap unknown errors in GenericError with the owner id only (no name, no balance)", async () => {
  spies.post.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "AccountDatasource - createAccount",
    error: expect.any(Error),
    ownerId: mocks.params.ownerId,
  });
});
