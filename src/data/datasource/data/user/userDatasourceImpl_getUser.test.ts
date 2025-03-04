import { setup, mocks, spies } from "./mocks/userDatasourceImpl_getUser";
import UserModel from "@data/models/user";
import { UserNotLoggedError, GenericError } from "@domain/entities/errors";

it("SHOULD return a user WHEN getUser is called", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.getUserSuccess as never);

  const user = await setup();

  expect(user).toEqual(
    new UserModel({
      id: "0092abf9-3a76-4063-a3e5-76ce873cb285",
      email: "user_email@email.com",
      name: "User Name",
      photoURL: "https://avatar.com",
    }),
  );
});

it("SHOULD throw a GenericError WHEN getUser is called and an error occurs", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.getUserError as never);

  await expect(setup()).rejects.toThrow(new GenericError("Error getting user"));
});

it("SHOULD throw a UserNotLoggedError WHEN getUser is called and the user is not logged", async () => {
  spies.getUser.mockResolvedValueOnce(mocks.authSessionMissingError as never);

  await expect(setup()).rejects.toThrow(new UserNotLoggedError());
});
