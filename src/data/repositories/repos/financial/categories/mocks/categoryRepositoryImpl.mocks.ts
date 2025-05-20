import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";

import categoryRepositoryImpl from "../categoryRepositoryImpl";
import * as createCategory from "../createCategory";
import * as deleteCategory from "../deleteCategory";
import * as getCategories from "../getCategories";
import * as updateCategory from "../updateCategory";

// region mocks

// endregion mocks

// region spies

const createCategorySpy = jest.spyOn(createCategory, "default");
createCategorySpy.mockResolvedValue("createCategory response" as never);

const deleteCategorySpy = jest.spyOn(deleteCategory, "default");
deleteCategorySpy.mockResolvedValue("deleteCategory response" as never);

const getCategoriesSpy = jest.spyOn(getCategories, "default");
getCategoriesSpy.mockResolvedValue("getCategories response" as never);

const updateCategorySpy = jest.spyOn(updateCategory, "default");
updateCategorySpy.mockResolvedValue("updateCategory response" as never);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return categoryRepositoryImpl(datasourcesMocks);
}

const spies = {
  createCategory: createCategorySpy,
  deleteCategory: deleteCategorySpy,
  getCategories: getCategoriesSpy,
  updateCategory: updateCategorySpy,
};

const mocks = {
  datasources: datasourcesMocks,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
