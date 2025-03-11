import {
  setup,
  mocks,
  spies,
} from "./mocks/loginDatasourceImpl_loginWithOAuth";
import { GenericError } from "@domain/entities/errors";

it("SHOULD login with OAuth", async () => {
  spies.signInWithOAuth.mockResolvedValueOnce(mocks.signInSuccess as never);

  const result = await setup();

  expect(spies.signInWithOAuth).toHaveBeenCalledTimes(1);
  expect(spies.signInWithOAuth).toHaveBeenCalledWith({
    provider: "google",
    options: {
      redirectTo: "https://project-website-url.com/login",
    },
  });
  expect(result).toBeTruthy();
});

it("SHOULD throw an GenericError if signIn fails", async () => {
  spies.signInWithOAuth.mockResolvedValueOnce(mocks.signInError as never);

  function func() {
    return setup();
  }

  await expect(func).rejects.toThrow(
    new GenericError(mocks.signInError.error.message),
  );
});
