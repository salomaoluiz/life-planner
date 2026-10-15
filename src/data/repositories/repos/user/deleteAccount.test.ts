import {
  AccountEmailMismatchError,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteAccount.mocks";

it("SHOULD delegate to the datasource with the email", async () => {
  spies.userDatasource.deleteAccount.mockResolvedValueOnce(undefined);

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.userDatasource.deleteAccount).toHaveBeenCalledWith(mocks.email);
});

it("SHOULD rethrow a BusinessError as the same instance", async () => {
  const error = new AccountEmailMismatchError();
  spies.userDatasource.deleteAccount.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError with repository context", async () => {
  spies.userDatasource.deleteAccount.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    error: expect.any(Error),
    repository: "userRepositoryImpl - deleteAccount",
  });
});
