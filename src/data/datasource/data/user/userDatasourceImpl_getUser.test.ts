import UserModel from "@data/models/user";
import { GenericError, UserNotLoggedError } from "@domain/entities/errors";

import { mocks, setup, spies } from "./mocks/userDatasourceImpl_getUser";

it("SHOULD return a user WHEN getUser is called", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.getUserSuccess as never);

  const user = await setup();

  expect(user).toEqual(
    new UserModel({
      email: "user_email@email.com",
      id: "0092abf9-3a76-4063-a3e5-76ce873cb285",
      name: "User Name",
      photoURL: "https://avatar.com",
    }),
  );
});

it("SHOULD throw a GenericError WHEN getUser is called and an error occurs", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.getUserError as never);

  await expect(setup()).rejects.toThrow(new GenericError());
});

it("SHOULD throw a UserNotLoggedError WHEN getUser is called and the user is not logged", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.authSessionMissingError as never);

  await expect(setup()).rejects.toThrow(new UserNotLoggedError());
});

it("SHOULD throw a UserNotLoggedError WHEN getUser is called and the user is not found", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.userNotFoundError as never);

  await expect(setup()).rejects.toThrow(new UserNotLoggedError());
});
