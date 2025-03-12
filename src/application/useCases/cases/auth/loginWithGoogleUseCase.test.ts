import { BusinessError } from "@domain/entities/errors";

import { loginWithGoogleSpy, setup } from "./mocks/loginWithGoogleUseCase";

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

it("SHOULD throw a BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError();
  loginWithGoogleSpy.mockRejectedValue(businessError);

  const result = () => setup().execute();

  await expect(result).rejects.toThrow(businessError);
});
