import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/signUpWithEmail.mocks";

it("SHOULD delegate to the datasource and not touch the cache", async () => {
  await setup();

  expect(spies.loginDatasource.signUpWithEmail).toHaveBeenCalledWith(
    mocks.params,
  );
  expect(spies.invalidate).not.toHaveBeenCalled();
});

it("SHOULD rethrow a BusinessError unchanged", async () => {
  spies.loginDatasource.signUpWithEmail.mockRejectedValueOnce(
    mocks.errors.business,
  );

  expect(await setupThrowable()).toBe(mocks.errors.business);
});

it("SHOULD wrap unknown errors in GenericError without the params", async () => {
  spies.loginDatasource.signUpWithEmail.mockRejectedValueOnce(
    mocks.errors.unknown,
  );

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    error: mocks.errors.unknown,
    repository: "loginRepositoryImpl - signUpWithEmail",
  });
});
