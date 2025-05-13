import UserModel from "@data/models/user/UserModel";
import { GenericError, UserNotLoggedError } from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/getUser.mocks";

it("SHOULD return a user WHEN getUser is called", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.success.response);

  const response = await setup();

  const user = mocks.success.response.data.user;
  const userMetadata = user?.user_metadata;
  expect(response).toEqual(
    UserModel.fromJSON({
      avatar_url: userMetadata?.avatar_url,
      email: userMetadata?.email,
      id: user?.id,
      name: userMetadata?.name,
    }),
  );
});

it("SHOULD throw a GenericError WHEN getUser returns an unknown error", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(GenericError);
  expect(result).toHaveProperty("context", {
    datasource: "UserDatasource - getUser",
    error: mocks.errors.unknown.error,
  });
});

it("SHOULD throw a UserNotLoggedError WHEN getUser is called and the user is not logged", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.errors.authSessionMissing);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(UserNotLoggedError);
  expect(result).toHaveProperty("context", {});
});

it("SHOULD throw a UserNotLoggedError WHEN getUser is called and the user is not found", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.errors.userNotFound);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(UserNotLoggedError);
  expect(result).toHaveProperty("context", {});
});
