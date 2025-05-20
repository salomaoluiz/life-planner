import { Datasources } from "@data/datasource";
import CategoryModel from "@data/models/financial/CategoryModel";
import CategoryEntity from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { FinancialCategoriesRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialCategoriesRepository["getCategories"]
>[0];

async function getCategories(ownerIds: Params, datasources: Datasources) {
  const cached = cache.get<Array<Record<string, unknown>> | null>(
    CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
  );

  let categoriesModel: CategoryModel[] = [];

  if (cached) {
    categoriesModel = cached.map((cache) => CategoryModel.fromJSON(cache));
  } else {
    categoriesModel =
      await datasources.financialCategoryDatasource.getCategories(ownerIds);
    cache.set<Record<string, unknown>[]>(
      CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
      categoriesModel.map((financial) => financial.toJSON()),
    );
  }

  return categoriesModel.map(
    (category) =>
      new CategoryEntity({
        depthLevel: category.depthLevel,
        icon: category.icon,
        id: category.id,
        name: category.name,
        owner: OwnerType[category.owner],
        ownerId: category.ownerId,
        parentId: category.parentId,
      }),
  );
}

export default getCategories;
