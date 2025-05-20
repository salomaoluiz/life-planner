import { Datasources } from "@data/datasource";
import { FinancialCategoriesRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialCategoriesRepository["updateCategory"]
>[0];

async function updateCategory(params: Params, datasources: Datasources) {
  await datasources.financialCategoryDatasource.updateCategory({
    depthLevel: params.depthLevel,
    icon: params.icon,
    id: params.id,
    name: params.name,
    owner: params.owner,
    ownerId: params.ownerId,
    parentId: params.parentId,
  });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA);
}

export default updateCategory;
