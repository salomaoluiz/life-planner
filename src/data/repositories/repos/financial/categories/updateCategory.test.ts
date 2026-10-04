import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/updateCategory.mocks";

it("SHOULD update a category", async () => {
  await setup();
  expect(spies.financialCategoryDatasource.updateCategory).toHaveBeenCalledWith(
    {
      depthLevel: mocks.defaultParams.depthLevel,
      icon: mocks.defaultParams.icon,
      iconColor: mocks.defaultParams.iconColor,
      id: mocks.defaultParams.id,
      name: mocks.defaultParams.name,
      owner: mocks.defaultParams.owner,
      ownerId: mocks.defaultParams.ownerId,
      parentId: mocks.defaultParams.parentId,
    },
  );
});

it("SHOULD invalidate cache after category updated", async () => {
  await setup();
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
  );
});
