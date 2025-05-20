import CategoryEntity from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/getCategories.mocks";

it("SHOULD NOT call cache.set and datasource if has cached data", async () => {
  spies.cache.get.mockReturnValue([mocks.firstCategory.toJSON()]);

  await setup();

  expect(spies.cache.set).not.toHaveBeenCalled();
  expect(
    spies.financialCategoryDatasource.getCategories,
  ).not.toHaveBeenCalled();
});

it("SHOULD return transactions from cache", async () => {
  spies.cache.get.mockReturnValue([mocks.firstCategory.toJSON()]);

  const result = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
  );
  expect(result).toEqual([
    new CategoryEntity({
      depthLevel: mocks.firstCategory.depthLevel,
      icon: mocks.firstCategory.icon,
      id: mocks.firstCategory.id,
      name: mocks.firstCategory.name,
      owner: OwnerType[mocks.firstCategory.owner],
      ownerId: mocks.firstCategory.ownerId,
      parentId: mocks.firstCategory.parentId,
    }),
  ]);
});

it("SHOULD call cache.set and datasource if has no cached data", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.financialCategoryDatasource.getCategories.mockResolvedValueOnce([
    mocks.firstCategory,
    mocks.secondCategory,
  ]);

  await setup();

  expect(spies.cache.set).toHaveBeenCalledTimes(1);
  expect(spies.cache.set).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
    [mocks.firstCategory.toJSON(), mocks.secondCategory.toJSON()],
  );
  expect(spies.financialCategoryDatasource.getCategories).toHaveBeenCalledTimes(
    1,
  );
  expect(spies.financialCategoryDatasource.getCategories).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
});

it("SHOULD return transactions from datasource", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.financialCategoryDatasource.getCategories.mockResolvedValueOnce([
    mocks.secondCategory,
  ]);

  const result = await setup();

  expect(result).toEqual([
    new CategoryEntity({
      depthLevel: mocks.secondCategory.depthLevel,
      icon: mocks.secondCategory.icon,
      id: mocks.secondCategory.id,
      name: mocks.secondCategory.name,
      owner: OwnerType[mocks.secondCategory.owner],
      ownerId: mocks.secondCategory.ownerId,
      parentId: mocks.secondCategory.parentId,
    }),
  ]);
});
