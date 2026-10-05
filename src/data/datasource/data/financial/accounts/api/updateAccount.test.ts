import {
  ApiBusinessError,
  FinancialNotFound,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateAccount.mocks";

it("SHOULD PATCH /v1/finance/accounts/:id with ONLY the editable fields (no owner, ownerId or id)", async () => {
  spies.patch.mockResolvedValueOnce({});

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.patch).toHaveBeenCalledWith(`/v1/finance/accounts/${mocks.id}`, {
    balance: 152075,
    icon: "bank",
    name: "Checking",
    status: "ARCHIVED",
  });
});

it("SHOULD send only the fields that are defined", async () => {
  spies.patch.mockResolvedValueOnce({});

  await setup({ ...mocks.onlyId, name: "Renamed" });

  const [, body] = spies.patch.mock.calls[0];
  expect(JSON.parse(JSON.stringify(body))).toEqual({ name: "Renamed" });
});

it("SHOULD skip the request WHEN there is nothing to update (the API rejects an empty body)", async () => {
  await setup({ ...mocks.onlyId });

  expect(spies.patch).not.toHaveBeenCalled();
});

it("SHOULD map a 404 to FinancialNotFound", async () => {
  spies.patch.mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

  expect(await setupThrowable()).toBeInstanceOf(FinancialNotFound);
});

it("SHOULD wrap unknown errors in GenericError with the account id only", async () => {
  spies.patch.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "AccountDatasource - updateAccount",
    error: expect.any(Error),
    id: mocks.id,
  });
});
