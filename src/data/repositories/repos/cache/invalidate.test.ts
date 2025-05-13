import { GenericError } from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/invalidate.mocks";

it("SHOULD invalidate cache", async () => {
  await setup();

  expect(spies.invalidateCache).toHaveBeenCalledTimes(1);
  expect(spies.invalidateCache).toHaveBeenCalledWith(mocks.defaultParams.keys, {
    uniqueId: mocks.defaultParams.options?.uniqueId,
  });
});

it("SHOULD throw an error when cache invalidation fails", async () => {
  spies.invalidateCache.mockImplementationOnce(() => {
    throw mocks.errors.unknown;
  });

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    error: mocks.errors.unknown,
    params: mocks.defaultParams,
    repository: "cacheRepositoryImpl - invalidate",
  });
});

it("SHOULD throw a business error when cache invalidation fails", async () => {
  spies.invalidateCache.mockImplementationOnce(() => {
    throw mocks.errors.business;
  });

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(mocks.errors.business.constructor);
  expect(error).toHaveProperty("context", {
    any_context: "any_context",
  });
});
