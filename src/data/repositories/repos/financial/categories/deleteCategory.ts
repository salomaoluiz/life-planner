import { Datasources } from "@data/datasource";
import { FinancialCategoriesRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialCategoriesRepository["deleteCategory"]
>[0];

async function deleteCategory(params: Params, datasources: Datasources) {
  await datasources.financialCategoryDatasource.deleteCategory({
    id: params.id,
    ownerId: params.ownerId,
  });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA);
}
export default deleteCategory;
