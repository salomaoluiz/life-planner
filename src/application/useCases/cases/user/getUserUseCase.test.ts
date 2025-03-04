import { captureExceptionSpy, getUserSpy, setup } from "./mocks/getUserUseCase";
import { BusinessError } from "@domain/entities/errors";

it("SHOULD call the repository to get user", async () => {
  await setup().execute();

  expect(getUserSpy).toHaveBeenCalledTimes(1);
});

it("SHOULD throw an error if the repository throws an error", async () => {
  const error = new Error("Error getting user");
  getUserSpy.mockRejectedValue(error);

  function func() {
    return setup().execute();
  }

  await expect(func).rejects.toThrow(error);
});

it("SHOULD capture an exception if the repository throws an error", async () => {
  const error = new Error("Error getting user");
  getUserSpy.mockRejectedValue(error);

  await expect(setup().execute()).rejects.toThrow(error);

  expect(captureExceptionSpy).toHaveBeenCalledTimes(1);
  expect(captureExceptionSpy).toHaveBeenCalledWith({
    name: "getUserUseCase",
    cause: error,
    message: "Error getting user",
  });
});

it("SHOULD return BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError("Business error related to get user");
  getUserSpy.mockRejectedValue(businessError);

  const result = await setup().execute();

  expect(result).toBe(businessError);
});
