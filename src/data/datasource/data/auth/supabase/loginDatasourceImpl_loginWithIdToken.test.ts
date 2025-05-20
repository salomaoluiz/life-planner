import LoginWithGoogleModel from "@data/models/auth/LoginWithGoogleModel";
import { GenericError, LoginCanceledError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
} from "./mocks/loginDatasourceImpl_loginWithIdToken.mocks";

it("SHOULD call the supabase to sign in with id token", async () => {
  spies.signIn.mockResolvedValueOnce(mocks.signInSuccess);

  await setup();

  expect(spies.signIn).toHaveBeenCalledTimes(1);
  expect(spies.signIn).toHaveBeenCalledWith();
  expect(spies.signInWithIdToken).toHaveBeenCalledTimes(1);
  expect(spies.signInWithIdToken).toHaveBeenCalledWith({
    provider: "google",
    token: mocks.signInSuccess.data.token,
  });
});

it("SHOULD return a LoginWithGoogleModel if signIn is successful", async () => {
  spies.signIn.mockResolvedValueOnce(mocks.signInSuccess);

  const result = await setup();

  const user = mocks.signInWithIdTokenResponse.data.user;
  const metadata = user?.user_metadata;

  expect(result).toEqual(
    new LoginWithGoogleModel({
      avatarURL: metadata?.avatar_url,
      email: user?.email,
      id: user?.id,
      name: metadata?.name,
    }),
  );
});

it("SHOULD throw an GenericError if signIn fails", async () => {
  spies.signIn.mockResolvedValueOnce(mocks.signInError);

  async function func() {
    return setup();
  }
  await expect(func).rejects.toThrow(new GenericError());
});

it("SHOULD throw an BusinessError if signIn is canceled", async () => {
  spies.signIn.mockResolvedValueOnce(mocks.signInCanceled);

  async function func() {
    return setup();
  }
  await expect(func).rejects.toThrow(new LoginCanceledError());
});
