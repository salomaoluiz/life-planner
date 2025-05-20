import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/updateCategory.mocks";

const updateCategory = spies.financialCategoryDatasource.updateCategory;

it("SHOULD update transaction AND invalidate cache WHEN called", async () => {
  await setup();

  expect(updateCategory).toHaveBeenCalledTimes(1);
  expect(updateCategory).toHaveBeenCalledWith({
    depthLevel: mocks.defaultParams.depthLevel,
    icon: mocks.defaultParams.icon,
    id: mocks.defaultParams.id,
    name: mocks.defaultParams.name,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    parentId: mocks.defaultParams.parentId,
  });

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
  );
});
