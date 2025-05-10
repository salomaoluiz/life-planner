import { BusinessError, UserNotLoggedError } from "@domain/entities/errors";

import { mocks, setup, spies } from "./mocks/saveWebSessionUseCase.mocks";

it("SHOULD throw and not save the session if the hash is undefined", async () => {
  async function result() {
    return setup(undefined);
  }

  await expect(result).rejects.toThrow(UserNotLoggedError);
  expect(spies.loginRepository.saveSession).not.toHaveBeenCalled();
});

it("SHOULD throw and not save the session if the access token is null", async () => {
  async function result() {
    return setup("#refresh_token=refresh");
  }

  await expect(result).rejects.toThrow(UserNotLoggedError);
  expect(spies.loginRepository.saveSession).not.toHaveBeenCalled();
});

it("SHOULD throw and not save the session if the refresh token is null", async () => {
  async function result() {
    return setup("#access_token=access");
  }

  await expect(result).rejects.toThrow(UserNotLoggedError);
  expect(spies.loginRepository.saveSession).not.toHaveBeenCalled();
});

it("SHOULD save the session if the hash is valid", async () => {
  spies.loginRepository.saveSession.mockResolvedValueOnce(
    mocks.loginWithGoogleEntity,
  );

  await setup("#access_token=access&refresh_token=refresh");

  expect(spies.loginRepository.saveSession).toHaveBeenCalledTimes(1);
  expect(spies.loginRepository.saveSession).toHaveBeenCalledWith({
    accessToken: "access",
    refreshToken: "refresh",
  });
});

it("SHOULD create a new user if the user is not found", async () => {
  spies.loginRepository.saveSession.mockResolvedValueOnce(
    mocks.loginWithGoogleEntity,
  );
  spies.userRepository.getUserById.mockResolvedValueOnce(undefined);

  await setup("#access_token=access&refresh_token=refresh");

  expect(spies.userRepository.createUser).toHaveBeenCalledTimes(1);
  expect(spies.userRepository.createUser).toHaveBeenCalledWith({
    avatarURL: mocks.loginWithGoogleEntity.avatarURL,
    email: mocks.loginWithGoogleEntity.email,
    id: mocks.loginWithGoogleEntity.id,
    name: mocks.loginWithGoogleEntity.name,
  });
});

it("SHOULD not create a new user if the user is found", async () => {
  spies.loginRepository.saveSession.mockResolvedValueOnce(
    mocks.loginWithGoogleEntity,
  );
  spies.userRepository.getUserById.mockResolvedValueOnce(mocks.userEntity);

  await setup("#access_token=access&refresh_token=refresh");

  expect(spies.userRepository.getUserById).toHaveBeenCalledTimes(1);
  expect(spies.userRepository.getUserById).toHaveBeenCalledWith(
    mocks.loginWithGoogleEntity.id,
  );
  expect(spies.userRepository.createUser).not.toHaveBeenCalled();
});

it("SHOULD throw an error if the repository throws an error", async () => {
  const error = new Error("Error saving the session");
  spies.loginRepository.saveSession.mockRejectedValueOnce(error);

  async function func() {
    return setup("#access_token=access&refresh_token=refresh");
  }

  await expect(func).rejects.toThrow(error);
});

it("SHOULD throw a BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError();
  spies.loginRepository.saveSession.mockRejectedValueOnce(businessError);

  async function result() {
    return setup("#access_token=access&refresh_token=refresh");
  }

  await expect(result).rejects.toThrow(businessError);
});
