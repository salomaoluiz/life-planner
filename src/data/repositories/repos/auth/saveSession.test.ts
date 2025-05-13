import { GenericError } from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/saveSession.mocks";

it("SHOULD save session", async () => {
  spies.loginDatasource.saveSession.mockResolvedValueOnce(
    mocks.success.saveSession,
  );

  await setup();

  expect(spies.loginDatasource.saveSession).toHaveBeenCalledTimes(1);
  expect(spies.loginDatasource.saveSession).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
});

it("SHOULD return a LoginWithGoogleEntity after save session", async () => {
  spies.loginDatasource.saveSession.mockResolvedValueOnce(
    mocks.success.saveSession,
  );

  const result = await setup();

  expect(result).toEqual(mocks.success.saveSession);
});

it("SHOULD throw a BusinessError if loginDatasource.saveSession throws a BusinessError", async () => {
  spies.loginDatasource.saveSession.mockRejectedValueOnce(
    mocks.errors.business,
  );

  const result = await setupThrowable();

  expect(result).toEqual(mocks.errors.business);
  expect(result).toHaveProperty("context", {
    any_context: "any_context",
  });
});

it("SHOULD throw a GenericError if loginDatasource.saveSession throws an unknown error", async () => {
  spies.loginDatasource.saveSession.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(GenericError);
  expect(result).toHaveProperty("context", {
    error: mocks.errors.unknown,
    repository: "loginRepositoryImpl - saveSession",
  });
});
