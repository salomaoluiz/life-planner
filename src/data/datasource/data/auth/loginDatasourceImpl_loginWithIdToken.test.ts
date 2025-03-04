import {
  setup,
  mocks,
  spies,
} from "./mocks/loginDatasourceImpl_loginWithIdToken";
import { GenericError, LoginCanceledError } from "@domain/entities/errors";

it("SHOULD login with IdToken", async () => {
  spies.signIn.mockResolvedValueOnce(mocks.signInSuccess);

  const result = await setup();

  expect(spies.signIn).toHaveBeenCalledTimes(1);
  expect(spies.signIn).toHaveBeenCalledWith();
  expect(spies.signInWithIdToken).toHaveBeenCalledTimes(1);
  expect(spies.signInWithIdToken).toHaveBeenCalledWith({
    token: mocks.signInSuccess.data.token,
    provider: "google",
  });
  expect(result).toBeTruthy();
});

it("SHOULD throw an GenericError if signIn fails", async () => {
  spies.signIn.mockResolvedValueOnce(mocks.signInError);

  function func() {
    return setup();
  }
  await expect(func).rejects.toThrow(
    new GenericError(mocks.signInError.error.message),
  );
});

it("SHOULD throw an BusinessError if signIn is canceled", async () => {
  spies.signIn.mockResolvedValueOnce(mocks.signInCanceled);

  function func() {
    return setup();
  }
  await expect(func).rejects.toThrow(new LoginCanceledError());
});
