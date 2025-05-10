import { BusinessError } from "@domain/entities/errors";

import { setup, spies } from "./mocks/logoutUseCase.mocks";

it("SHOULD call the repository to logout", async () => {
  await setup().execute();

  expect(spies.loginRepository.logout).toHaveBeenCalledTimes(1);
});

it("SHOULD throw an error if the repository throws an error", async () => {
  const error = new Error("Error logging out");
  spies.loginRepository.logout.mockRejectedValueOnce(error);

  async function func() {
    return setup().execute();
  }

  await expect(func).rejects.toThrow(error);
});

it("SHOULD throw a BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError();
  spies.loginRepository.logout.mockRejectedValueOnce(businessError);

  async function result() {
    return setup().execute();
  }

  await expect(result).rejects.toThrow(businessError);
});
