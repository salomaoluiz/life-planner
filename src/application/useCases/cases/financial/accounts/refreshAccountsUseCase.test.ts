import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import { CacheStringKeys } from "@infrastructure/cache";

import refreshAccountsUseCase from "./refreshAccountsUseCase";

it("SHOULD refresh accounts", async () => {
  const useCase = refreshAccountsUseCase(repositoriesMocks);
  await useCase.execute();
  expect(repositoriesMocks.cacheRepository.invalidate).toHaveBeenCalled();
});

describe("error handling", () => {
  function invalidate() {
    return jest.mocked(repositoriesMocks.cacheRepository.invalidate);
  }

  it("SHOULD invalidate the cache key", async () => {
    await refreshAccountsUseCase(repositoriesMocks).execute();

    expect(invalidate()).toHaveBeenCalledWith({
      keys: [CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA],
    });
  });

  it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
    const error = new BusinessError();
    invalidate().mockRejectedValueOnce(error);

    await expect(
      refreshAccountsUseCase(repositoriesMocks).execute(),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.refreshAccountsUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    invalidate().mockRejectedValueOnce(error);

    await expect(
      refreshAccountsUseCase(repositoriesMocks).execute(),
    ).rejects.toBe(error);
  });
});
