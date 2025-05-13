import { GenericError } from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/logout.mocks";

it("SHOULD logout and invalidate all cache", async () => {
  await setup();

  expect(spies.loginDatasource.logout).toHaveBeenCalledTimes(1);
  expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
});

it("SHOULD throw a BusinessError", async () => {
  spies.loginDatasource.logout.mockRejectedValueOnce(mocks.errors.business);

  const error = await setupThrowable();

  expect(error).toEqual(mocks.errors.business);
  expect(error).toHaveProperty("context", {
    any_context: "any_context",
  });
});

it("SHOULD throw a GenericError", async () => {
  spies.loginDatasource.logout.mockRejectedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    error: mocks.errors.unknown,
    repository: "loginRepositoryImpl - logout",
  });
});
