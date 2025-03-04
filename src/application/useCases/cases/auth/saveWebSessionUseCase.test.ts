import {
  saveSessionSpy,
  captureExceptionSpy,
  setup,
} from "./mocks/saveWebSessionUseCase";
import { BusinessError } from "@domain/entities/errors";

it("SHOULD not save the session if the hash is undefined", async () => {
  await setup(undefined);

  expect(saveSessionSpy).not.toHaveBeenCalled();
});

it("SHOULD not save the session if the access token is null", async () => {
  await setup("#refresh_token=refresh");

  expect(saveSessionSpy).not.toHaveBeenCalled();
});

it("SHOULD not save the session if the refresh token is null", async () => {
  await setup("#access_token=access");

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

it("SHOULD capture an exception if the repository throws an error", async () => {
  const error = new Error("Error logging out");
  saveSessionSpy.mockRejectedValue(error);

  function func() {
    return setup("#access_token=access&refresh_token=refresh");
  }

  await expect(func).rejects.toThrow(error);

  expect(captureExceptionSpy).toHaveBeenCalledTimes(1);
  expect(captureExceptionSpy).toHaveBeenCalledWith({
    cause: error,
    message: "Error saving web session",
    name: "saveWebSessionUseCase",
  });
});

it("SHOULD return a BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError("Business Error Related Logout");
  saveSessionSpy.mockRejectedValue(businessError);

  const result = await setup("#access_token=access&refresh_token=refresh");

  expect(result).toBe(businessError);
});
