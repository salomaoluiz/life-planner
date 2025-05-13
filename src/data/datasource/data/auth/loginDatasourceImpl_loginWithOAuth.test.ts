import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
} from "./mocks/loginDatasourceImpl_loginWithOAuth.mocks";

it("SHOULD login with OAuth", async () => {
  spies.signInWithOAuth.mockResolvedValueOnce(mocks.signInSuccess as never);

  const result = await setup();

  expect(spies.signInWithOAuth).toHaveBeenCalledTimes(1);
  expect(spies.signInWithOAuth).toHaveBeenCalledWith({
    options: {
      redirectTo: "https://project-website-url.com/login",
    },
    provider: "google",
  });
  expect(result).toBeTruthy();
});

it("SHOULD throw an GenericError if signIn fails", async () => {
  spies.signInWithOAuth.mockResolvedValueOnce(mocks.signInError as never);

  async function func() {
    return setup();
  }

  await expect(func).rejects.toThrow(new GenericError());
});
