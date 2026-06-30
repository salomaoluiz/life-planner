import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/deleteCategory.mocks";

it("SHOULD delete a category", async () => {
  await setup();
  expect(spies.financialCategoryDatasource.deleteCategory).toHaveBeenCalledWith(
    {
      id: mocks.defaultParams.id,
      ownerId: mocks.defaultParams.ownerId,
    },
  );
});

it("SHOULD invalidate cache after category deleted", async () => {
  await setup();
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
  );
});
