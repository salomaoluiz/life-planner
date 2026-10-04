import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";

import createCategory from "./createCategory";
import deleteCategory from "./deleteCategory";
import getCategories from "./getCategories";
import updateCategory from "./updateCategory";

function categoryDatasourceImpl(): CategoryDatasource {
  return {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
  };
}

export default categoryDatasourceImpl;
