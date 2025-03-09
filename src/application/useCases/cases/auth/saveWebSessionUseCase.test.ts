import { saveSessionSpy, setup } from "./mocks/saveWebSessionUseCase";
import { BusinessError, UserNotLoggedError } from "@domain/entities/errors";

it("SHOULD throw and not save the session if the hash is undefined", async () => {
  const result = () => setup(undefined);

  await expect(result).rejects.toThrow(UserNotLoggedError);
  expect(saveSessionSpy).not.toHaveBeenCalled();
});

it("SHOULD throw and not save the session if the access token is null", async () => {
  const result = () => setup("#refresh_token=refresh");

  await expect(result).rejects.toThrow(UserNotLoggedError);
  expect(saveSessionSpy).not.toHaveBeenCalled();
});

it("SHOULD throw and not save the session if the refresh token is null", async () => {
  const result = () => setup("#access_token=access");

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

  function func() {
    return setup("#access_token=access&refresh_token=refresh");
  }

  await expect(func).rejects.toThrow(error);
});

it("SHOULD throw a BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError();
  saveSessionSpy.mockRejectedValue(businessError);

  const result = () => setup("#access_token=access&refresh_token=refresh");

  await expect(result).rejects.toThrow(businessError);
});
