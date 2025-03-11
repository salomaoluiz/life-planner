import {
  loginWithGoogleSpy,
  captureExceptionSpy,
  setup,
} from "./mocks/loginWithGoogleUseCase";
import { BusinessError } from "@domain/entities/errors";

it("SHOULD call the repository to login with Google", async () => {
  await setup().execute();

  expect(loginWithGoogleSpy).toHaveBeenCalledTimes(1);
});

it("SHOULD throw an error if the repository throws an error", async () => {
  const error = new Error("Error logging in with Google");
  loginWithGoogleSpy.mockRejectedValue(error);

  function func() {
    return setup().execute();
  }

  await expect(func).rejects.toThrow(error);
});

it("SHOULD capture an exception if the repository throws an error", async () => {
  const error = new Error("Error logging in with Google");
  loginWithGoogleSpy.mockRejectedValue(error);

  await expect(setup().execute()).rejects.toThrow(error);

  expect(captureExceptionSpy).toHaveBeenCalledTimes(1);
  expect(captureExceptionSpy).toHaveBeenCalledWith({
    name: "loginWithGoogleUseCase",
    cause: error,
    message: "Error logging in with Google",
  });
});

it("SHOULD return a BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError();
  loginWithGoogleSpy.mockRejectedValue(businessError);

  const result = await setup().execute();

  expect(result).toBe(businessError);
});
