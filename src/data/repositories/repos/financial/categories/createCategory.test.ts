import CategoryEntity from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/createCategory.mocks";

it("SHOULD create a transaction", async () => {
  await setup();

  expect(spies.financialCategoryDatasource.createCategory).toHaveBeenCalledWith(
    {
      depthLevel: mocks.defaultParams.depthLevel,
      icon: mocks.defaultParams.icon,
      name: mocks.defaultParams.name,
      owner: mocks.defaultParams.owner,
      ownerId: mocks.defaultParams.ownerId,
      parentId: mocks.defaultParams.parentId,
    },
  );
});

it("SHOULD return a transaction created", async () => {
  const result = await setup();

  expect(result).toEqual(
    new CategoryEntity({
      depthLevel: mocks.categoryModel.depthLevel,
      icon: mocks.categoryModel.icon,
      id: mocks.categoryModel.id,
      name: mocks.categoryModel.name,
      owner: OwnerType[mocks.categoryModel.owner],
      ownerId: mocks.categoryModel.ownerId,
      parentId: mocks.categoryModel.parentId,
    }),
  );
});

it("SHOULD invalidate cache after transaction created", async () => {
  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
  );
});
