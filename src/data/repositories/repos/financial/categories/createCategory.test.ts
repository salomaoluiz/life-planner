import CategoryEntity, {
  CategoryType,
} from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/createCategory.mocks";

it("SHOULD create a category", async () => {
  await setup();
  expect(spies.financialCategoryDatasource.createCategory).toHaveBeenCalledWith(
    {
      depthLevel: mocks.defaultParams.depthLevel,
      icon: mocks.defaultParams.icon,
      iconColor: mocks.defaultParams.iconColor,
      name: mocks.defaultParams.name,
      owner: mocks.defaultParams.owner,
      ownerId: mocks.defaultParams.ownerId,
      parentId: mocks.defaultParams.parentId,
      type: mocks.defaultParams.type,
    },
  );
});

it("SHOULD return a category created", async () => {
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
      type: CategoryType[mocks.categoryModel.type as keyof typeof CategoryType],
    }),
  );
});

it("SHOULD invalidate cache after category created", async () => {
  await setup();
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
  );
});
