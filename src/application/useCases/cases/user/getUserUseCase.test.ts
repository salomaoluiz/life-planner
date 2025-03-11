import { spies, mocks, setup } from "./mocks/getUserUseCase";
import { BusinessError } from "@domain/entities/errors";

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

it("SHOULD capture an exception if the repository throws an error", async () => {
  const error = new Error("Error getting user");
  spies.getUser.mockRejectedValue(error);

  await expect(setup().execute()).rejects.toThrow(error);

  expect(spies.captureException).toHaveBeenCalledTimes(1);
  expect(spies.captureException).toHaveBeenCalledWith({
    name: "getUserUseCase",
    cause: error,
    message: "Error getting user",
  });
});

it("SHOULD return BusinessError if the repository throws a BusinessError", async () => {
  const businessError = new BusinessError();
  spies.getUser.mockRejectedValue(businessError);

  const result = await setup().execute();

  expect(result).toBe(businessError);
});
