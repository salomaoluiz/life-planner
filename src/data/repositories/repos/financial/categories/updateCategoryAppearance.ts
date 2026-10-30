import { Datasources } from "@data/datasource";
import { FinancialCategoryRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialCategoryRepository["updateCategoryAppearance"]
>[0];

async function updateCategoryAppearance(
  params: Params,
  datasources: Datasources,
) {
  await datasources.financialCategoryDatasource.updateCategoryAppearance({
    depthLevel: params.depthLevel,
    descendants: params.descendants,
    icon: params.icon,
    iconColor: params.iconColor,
    id: params.id,
    name: params.name,
    owner: params.owner,
    ownerId: params.ownerId,
    parentId: params.parentId,
    scope: params.scope,
    status: params.status,
    type: params.type,
  });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA);
}

export default updateCategoryAppearance;
