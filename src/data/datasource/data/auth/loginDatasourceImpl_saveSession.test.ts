import LoginWithGoogleModel from "@data/models/auth/LoginWithGoogleModel";
import { BusinessError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/loginDatasourceImpl_saveSession.mocks";

it("SHOULD call the supabase to sign in with id token", async () => {
  await setup();

  expect(spies.setSession).toHaveBeenCalledTimes(1);
  expect(spies.setSession).toHaveBeenCalledWith({
    access_token: "accessToken",
    refresh_token: "refreshToken",
  });
});

it("SHOULD return a LoginWithGoogleModel if setSession is successful", async () => {
  const result = await setup();

  const user = mocks.setSessionResponse.data.user;
  const metadata = user.user_metadata;

  expect(result).toEqual(
    new LoginWithGoogleModel({
      avatarURL: metadata.avatar_url,
      email: user.email,
      id: user.id,
      name: metadata.name,
    }),
  );
});

it("SHOULD throw an BusinessError if session is missing", async () => {
  spies.setSession.mockResolvedValueOnce(mocks.errors.authSessionMissing);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
});

it("SHOULD throw an GenericError if error name is not related with missing session", async () => {
  spies.setSession.mockResolvedValueOnce(mocks.errors.unknownNamed);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(GenericError);
  expect(result).toHaveProperty("context", {
    datasource: "LoginDatasource - saveSession",
    result: mocks.errors.unknownNamed,
  });
});

it("SHOULD throw an GenericError if setSession fails", async () => {
  spies.setSession.mockResolvedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(GenericError);
  expect(result).toHaveProperty("context", {
    datasource: "LoginDatasource - saveSession",
    result: mocks.errors.unknown,
  });
});
