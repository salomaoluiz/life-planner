import { BusinessError } from "@domain/entities/errors";

import { mocks, setup, spies } from "./mocks/getUserUseCase";

it("SHOULD call the repository to get user", async () => {
  spies.getUser.mockResolvedValue(mocks.getUserSuccessResponse);

  const result = await setup().execute();

  expect(spies.getUser).toHaveBeenCalledTimes(1);
  expect(result).toBe(mocks.getUserSuccessResponse);
});

it("SHOULD throw an error if the repository throws an error", async () => {
  const error = new Error("Error getting user");
  spies.getUser.mockRejectedValue(error);

  function func() {
    return setup().execute();
  }

  await expect(func).rejects.toThrow(error);
});

it("SHOULD throw BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError();
  spies.getUser.mockRejectedValue(businessError);

  const result = () => setup().execute();

  await expect(result).rejects.toThrow(businessError);
});
