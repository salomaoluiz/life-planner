import { CacheStringKeys } from "@domain/entities/cache/keys";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/refreshTransactionsUseCase.mocks";

const invalidateSpy = spies.cacheRepository.invalidate;

it("SHOULD invalidate the cache related with transaction financial", async () => {
  await setup();

  expect(invalidateSpy).toHaveBeenCalledTimes(1);
  expect(invalidateSpy).toHaveBeenCalledWith({
    keys: [CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA],
  });
});

it("SHOULD throw if the repository throws", async () => {
  invalidateSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  invalidateSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "financial.refreshTransactionsUseCase",
  });
});
