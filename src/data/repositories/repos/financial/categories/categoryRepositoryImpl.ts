import { Datasources } from "@data/datasource";
import CategoryEntity from "@domain/entities/financial/CategoryEntity";
import { FinancialCategoriesRepository } from "@domain/repositories/financial";

import createCategory from "./createCategory";
import deleteCategory from "./deleteCategory";
import getCategories from "./getCategories";
import updateCategory from "./updateCategory";

function categoryRepositoryImpl(
  datasources: Datasources,
): FinancialCategoriesRepository {
  return {
    async createCategory(params): Promise<CategoryEntity> {
      return createCategory(params, datasources);
    },
    async deleteCategory(params): Promise<void> {
      return deleteCategory(params, datasources);
    },
    async getCategories(ownerIds): Promise<CategoryEntity[]> {
      return getCategories(ownerIds, datasources);
    },
    async updateCategory(params): Promise<void> {
      return updateCategory(params, datasources);
    },
  };
}

export default categoryRepositoryImpl;
