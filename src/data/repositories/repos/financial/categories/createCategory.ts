import { Datasources } from "@data/datasource";
import CategoryEntity from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { FinancialCategoryRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialCategoryRepository["createCategory"]
>[0];

async function createCategory(params: Params, datasources: Datasources) {
  const category = await datasources.financialCategoryDatasource.createCategory(
    {
      depthLevel: params.depthLevel,
      icon: params.icon,
      iconColor: params.iconColor,
      name: params.name,
      owner: params.owner,
      ownerId: params.ownerId,
      parentId: params.parentId,
    },
  );

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA);

  return new CategoryEntity({
    depthLevel: category.depthLevel,
    icon: category.icon,
    iconColor: category.iconColor,
    id: category.id,
    name: category.name,
    owner: OwnerType[category.owner],
    ownerId: category.ownerId,
    parentId: category.parentId,
  });
}

export default createCategory;
