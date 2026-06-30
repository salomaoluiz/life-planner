import { CacheStringKeys } from "@domain/entities/cache/keys";

import { setup, spies } from "./mocks/refreshCategoriesUseCase.mocks";

it("SHOULD call cache invalidate correctly", async () => {
  await setup();
  expect(spies.cacheRepository.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cacheRepository.invalidate).toHaveBeenCalledWith({
    keys: [CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA],
  });
});
