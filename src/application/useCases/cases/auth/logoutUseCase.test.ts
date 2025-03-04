import { logoutSpy, captureExceptionSpy, setup } from "./mocks/logoutUseCase";
import { BusinessError } from "@domain/entities/errors";

it("SHOULD call the repository to logout", async () => {
  await setup().execute();

  expect(logoutSpy).toHaveBeenCalledTimes(1);
});

it("SHOULD throw an error if the repository throws an error", async () => {
  const error = new Error("Error logging out");
  logoutSpy.mockRejectedValue(error);

  function func() {
    return setup().execute();
  }

  await expect(func).rejects.toThrow(error);
});

it("SHOULD capture an exception if the repository throws an error", async () => {
  const error = new Error("Error logging out");
  logoutSpy.mockRejectedValue(error);

  await expect(setup().execute()).rejects.toThrow(error);

  expect(captureExceptionSpy).toHaveBeenCalledTimes(1);
  expect(captureExceptionSpy).toHaveBeenCalledWith({
    cause: error,
    message: "Error logging out",
    name: "logoutUseCase",
  });
});

it("SHOULD return a BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError("Business Error Related Logout");
  logoutSpy.mockRejectedValue(businessError);

  const result = await setup().execute();

  expect(result).toBe(businessError);
});
