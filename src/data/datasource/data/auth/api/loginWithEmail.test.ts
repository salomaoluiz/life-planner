import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
  InvalidCredentialsError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/loginWithEmail.mocks";

it("SHOULD post the credentials and store the returned token", async () => {
  spies.post.mockResolvedValueOnce({ token: "jwt" });

  await setup();

  expect(spies.post).toHaveBeenCalledWith("/v1/auth/login/email", mocks.params);
  expect(spies.setToken).toHaveBeenCalledWith("jwt");
});

it("SHOULD throw InvalidCredentialsError WHEN the API answers 401", async () => {
  spies.post.mockRejectedValueOnce(
    new ApiBusinessError("Invalid Credentials", 401),
  );

  expect(await setupThrowable()).toBeInstanceOf(InvalidCredentialsError);
  expect(spies.setToken).not.toHaveBeenCalled();
});

it("SHOULD rethrow other business errors (network, validation)", async () => {
  const error = new ConnectivityError();
  spies.post.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap unknown errors in GenericError WITHOUT the credentials in the context", async () => {
  spies.post.mockRejectedValueOnce(new Error("boom"));

  const error = (await setupThrowable()) as GenericError;

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toEqual({
    datasource: "LoginDatasource - loginWithEmail",
    error: expect.any(Error),
  });
  expect(JSON.stringify(error.context)).not.toContain(mocks.params.password);
});

it("SHOULD wrap a missing token in the response as GenericError", async () => {
  spies.post.mockResolvedValueOnce({});

  expect(await setupThrowable()).toBeInstanceOf(GenericError);
});
