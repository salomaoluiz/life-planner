import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { CacheStringKeys } from "@domain/entities/cache/keys";
import { BusinessError } from "@domain/entities/errors";

import { setup, spies } from "./mocks/refreshCategoriesUseCase.mocks";
import refreshCategoriesUseCase from "./refreshCategoriesUseCase";

it("SHOULD call cache invalidate correctly", async () => {
  await setup();
  expect(spies.cacheRepository.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cacheRepository.invalidate).toHaveBeenCalledWith({
    keys: [CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA],
  });
});

describe("error handling", () => {
  function invalidate() {
    return jest.mocked(repositoriesMocks.cacheRepository.invalidate);
  }

  it("SHOULD invalidate the cache key", async () => {
    await refreshCategoriesUseCase(repositoriesMocks).execute();

    expect(invalidate()).toHaveBeenCalledWith({
      keys: [CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA],
    });
  });

  it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
    const error = new BusinessError();
    invalidate().mockRejectedValueOnce(error);

    await expect(
      refreshCategoriesUseCase(repositoriesMocks).execute(),
    ).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: "financial.refreshCategoriesUseCase",
    });
  });

  it("SHOULD rethrow unknown errors untouched", async () => {
    const error = new Error("boom");
    invalidate().mockRejectedValueOnce(error);

    await expect(
      refreshCategoriesUseCase(repositoriesMocks).execute(),
    ).rejects.toBe(error);
  });
});
