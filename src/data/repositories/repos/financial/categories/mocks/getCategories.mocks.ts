import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import CategoryModel from "@data/models/financial/CategoryModel";
import cache from "@infrastructure/cache";

import getCategories, { Params } from "../getCategories";

const defaultParams: Params = ["user-id"];

const categoryModelMock = new CategoryModel({
  depthLevel: 0,
  icon: "icon",
  id: "cat-uuid",
  name: "Category",
  owner: "USER",
  ownerId: "user-id",
  parentId: undefined,
});

const datasourceSpy = jest.mocked(datasourcesMocks.financialCategoryDatasource);
datasourceSpy.getCategories.mockResolvedValue([categoryModelMock]);

const cacheGetSpy = jest.spyOn(cache, "get");
const cacheSetSpy = jest.spyOn(cache, "set");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getCategories(defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    get: cacheGetSpy,
    set: cacheSetSpy,
  },
  financialCategoryDatasource: datasourceSpy,
};

const mocks = {
  categoriesList: [categoryModelMock],
  defaultParams,
};

export { mocks, setup, spies };
