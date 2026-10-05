import AccountModel from "@data/models/financial/AccountModel";
import {
  ApiBusinessError,
  ConnectivityError,
  FieldInvalid,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/getAccounts.mocks";

it("SHOULD GET /v1/finance/accounts with repeated ownerId params AND return AccountModels (cents -> decimal)", async () => {
  spies.get.mockResolvedValueOnce(mocks.apiAccounts);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith(
    `/v1/finance/accounts?ownerId=${mocks.ownerIds[0]}&ownerId=${mocks.ownerIds[1]}`,
  );
  expect(result).toEqual([AccountModel.fromJSON(mocks.apiAccounts[0])]);
  expect(result[0].balance).toBe(1520.75);
});

it("SHOULD NOT call the API WHEN there are no ownerIds (it would return every accessible owner)", async () => {
  expect(await setup([])).toEqual([]);
  expect(spies.get).not.toHaveBeenCalled();
});

it("SHOULD return an empty list WHEN the API returns []", async () => {
  spies.get.mockResolvedValueOnce([]);

  expect(await setup()).toEqual([]);
});

it("SHOULD map a 400 (e.g. a legacy non-uuid owner id) to FieldInvalid", async () => {
  spies.get.mockRejectedValueOnce(
    new ApiBusinessError("Validation Failed", 400),
  );

  expect(await setupThrowable()).toBeInstanceOf(FieldInvalid);
});

it.each([
  ["ConnectivityError", new ConnectivityError()],
  ["UserNotLoggedError", new UserNotLoggedError()],
])("SHOULD re-throw %s", async (_name, error) => {
  spies.get.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with the owner ids only", async () => {
  spies.get.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "AccountDatasource - getAccounts",
    error: expect.any(Error),
    ownerIds: mocks.ownerIds,
  });
});
