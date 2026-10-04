import {
  ApiBusinessError,
  ConnectivityError,
  EmailAlreadyInUseError,
  GenericError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/signUpWithEmail.mocks";

it("SHOULD post the sign up data", async () => {
  spies.post.mockResolvedValueOnce(undefined);

  await setup();

  expect(spies.post).toHaveBeenCalledWith(
    "/v1/auth/signup/email",
    mocks.params,
  );
});

it("SHOULD throw EmailAlreadyInUseError WHEN the API answers 422", async () => {
  spies.post.mockRejectedValueOnce(
    new ApiBusinessError("Email already in use", 422),
  );

  expect(await setupThrowable()).toBeInstanceOf(EmailAlreadyInUseError);
});

it("SHOULD rethrow other API business errors (400)", async () => {
  const error = new ApiBusinessError("Validation Failed", 400);
  spies.post.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD rethrow ConnectivityError", async () => {
  const error = new ConnectivityError();
  spies.post.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError WITHOUT the password in the context", async () => {
  spies.post.mockRejectedValueOnce(new Error("boom"));

  const error = (await setupThrowable()) as GenericError;

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toEqual({
    datasource: "LoginDatasource - signUpWithEmail",
    error: expect.any(Error),
  });
  expect(JSON.stringify(error.context)).not.toContain(mocks.params.password);
});
