import { Datasources } from "@data/datasource";
import { FinancialCategoryRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialCategoryRepository["deleteCategory"]
>[0];

async function deleteCategory(params: Params, datasources: Datasources) {
  await datasources.financialCategoryDatasource.deleteCategory({
    id: params.id,
    ownerId: params.ownerId,
  });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA);
}

export default deleteCategory;
