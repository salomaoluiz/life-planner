import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/deleteCategory.mocks";

it("SHOULD delete a transaction AND invalidate cache WHEN called", async () => {
  await setup();

  expect(spies.financialCategoryDatasource.deleteCategory).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
  );
  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
});
