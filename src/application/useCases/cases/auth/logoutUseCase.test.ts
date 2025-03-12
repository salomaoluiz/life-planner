import { BusinessError } from "@domain/entities/errors";

import { logoutSpy, setup } from "./mocks/logoutUseCase";

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

it("SHOULD throw a BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError();
  logoutSpy.mockRejectedValue(businessError);

  function result() {
    return setup().execute();
  }

  await expect(result).rejects.toThrow(businessError);
});
