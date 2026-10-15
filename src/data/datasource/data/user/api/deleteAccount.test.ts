import {
  AccountEmailMismatchError,
  ApiBusinessError,
  ConnectivityError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteAccount.mocks";

it("SHOULD call DELETE /v1/user/me with the email AND resolve", async () => {
  spies.delete.mockResolvedValueOnce(undefined);

  await expect(setup()).resolves.toBeUndefined();

  expect(spies.delete).toHaveBeenCalledWith("/v1/user/me", {
    email: mocks.email,
  });
});

it("SHOULD map a 422 to AccountEmailMismatchError", async () => {
  spies.delete.mockRejectedValueOnce(
    new ApiBusinessError("Email does not match", 422),
  );

  expect(await setupThrowable()).toBeInstanceOf(AccountEmailMismatchError);
});

it("SHOULD rethrow other business errors untouched", async () => {
  const badRequest = new ApiBusinessError("Validation Failed", 400);
  spies.delete.mockRejectedValueOnce(badRequest);
  expect(await setupThrowable()).toBe(badRequest);

  spies.delete.mockRejectedValueOnce(new UserNotLoggedError());
  expect(await setupThrowable()).toBeInstanceOf(UserNotLoggedError);

  spies.delete.mockRejectedValueOnce(new ConnectivityError());
  expect(await setupThrowable()).toBeInstanceOf(ConnectivityError);
});

it("SHOULD wrap unknown and server errors in GenericError WITHOUT the email in the context", async () => {
  spies.delete.mockRejectedValueOnce(new Error("boom"));

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "UserDatasource - deleteAccount",
    error: expect.any(Error),
  });
  expect(JSON.stringify((error as GenericError).context)).not.toContain(
    mocks.email,
  );

  spies.delete.mockRejectedValueOnce(new GenericError());
  expect(await setupThrowable()).toBeInstanceOf(GenericError);
});
