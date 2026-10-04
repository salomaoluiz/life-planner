import { GenericError } from "@domain/entities/errors";
import { CacheStringKeys } from "@infrastructure/cache";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/loginWithEmail.mocks";

it("SHOULD log in and invalidate the cached user AFTER the datasource resolved", async () => {
  const order: string[] = [];
  spies.loginDatasource.loginWithEmail.mockImplementationOnce(async () => {
    order.push("login");
  });
  spies.invalidate.mockImplementationOnce(() => {
    order.push("invalidate");
  });

  await setup();

  expect(spies.loginDatasource.loginWithEmail).toHaveBeenCalledWith(
    mocks.params,
  );
  expect(spies.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
  );
  expect(order).toEqual(["login", "invalidate"]);
});

it("SHOULD rethrow a BusinessError unchanged and not touch the cache", async () => {
  spies.loginDatasource.loginWithEmail.mockRejectedValueOnce(
    mocks.errors.business,
  );

  const error = await setupThrowable();

  expect(error).toBe(mocks.errors.business);
  expect(spies.invalidate).not.toHaveBeenCalled();
});

it("SHOULD wrap unknown errors in GenericError without the params", async () => {
  spies.loginDatasource.loginWithEmail.mockRejectedValueOnce(
    mocks.errors.unknown,
  );

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    error: mocks.errors.unknown,
    repository: "loginRepositoryImpl - loginWithEmail",
  });
});
