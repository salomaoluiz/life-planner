import { BusinessError, UserNotLoggedError } from "@domain/entities/errors";

import { saveSessionSpy, setup } from "./mocks/saveWebSessionUseCase";

it("SHOULD throw and not save the session if the hash is undefined", async () => {
  async function result() {
    return setup(undefined);
  }

  await expect(result).rejects.toThrow(UserNotLoggedError);
  expect(saveSessionSpy).not.toHaveBeenCalled();
});

it("SHOULD throw and not save the session if the access token is null", async () => {
  async function result() {
    return setup("#refresh_token=refresh");
  }

  await expect(result).rejects.toThrow(UserNotLoggedError);
  expect(saveSessionSpy).not.toHaveBeenCalled();
});

it("SHOULD throw and not save the session if the refresh token is null", async () => {
  async function result() {
    return setup("#access_token=access");
  }

  await expect(result).rejects.toThrow(UserNotLoggedError);
  expect(saveSessionSpy).not.toHaveBeenCalled();
});

it("SHOULD save the session if the hash is valid", async () => {
  await setup("#access_token=access&refresh_token=refresh");

  expect(saveSessionSpy).toHaveBeenCalledTimes(1);
  expect(saveSessionSpy).toHaveBeenCalledWith({
    accessToken: "access",
    refreshToken: "refresh",
  });
});

it("SHOULD throw an error if the repository throws an error", async () => {
  const error = new Error("Error saving the session");
  saveSessionSpy.mockRejectedValue(error);

  async function func() {
    return setup("#access_token=access&refresh_token=refresh");
  }

  await expect(func).rejects.toThrow(error);
});

it("SHOULD throw a BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError();
  saveSessionSpy.mockRejectedValue(businessError);

  async function result() {
    return setup("#access_token=access&refresh_token=refresh");
  }

  await expect(result).rejects.toThrow(businessError);
});
