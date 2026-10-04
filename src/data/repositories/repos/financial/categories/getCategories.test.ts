import CategoryEntity, {
  CategoryType,
} from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { mocks, setup, spies } from "./mocks/getCategories.mocks";

it("SHOULD get categories from datasource when cache is empty", async () => {
  spies.cache.get.mockReturnValueOnce(null);
  const result = await setup();
  expect(spies.financialCategoryDatasource.getCategories).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
  expect(result[0]).toEqual(
    new CategoryEntity({
      depthLevel: mocks.categoriesList[0].depthLevel,
      icon: mocks.categoriesList[0].icon,
      id: mocks.categoriesList[0].id,
      name: mocks.categoriesList[0].name,
      owner: OwnerType[mocks.categoriesList[0].owner],
      ownerId: mocks.categoriesList[0].ownerId,
      parentId: mocks.categoriesList[0].parentId,
      type: CategoryType[
        mocks.categoriesList[0].type as keyof typeof CategoryType
      ],
    }),
  );
});

it("SHOULD get categories from cache when cache is full", async () => {
  spies.cache.get.mockReturnValueOnce([mocks.categoriesList[0].toJSON()]);
  const result = await setup();
  expect(
    spies.financialCategoryDatasource.getCategories,
  ).not.toHaveBeenCalled();
  expect(result[0]).toBeInstanceOf(CategoryEntity);
});
