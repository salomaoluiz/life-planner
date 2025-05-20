import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import CategoryModel from "@data/models/financial/CategoryModel";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache from "@infrastructure/cache";

import getCategories, { Params } from "../getCategories";

// region mocks
const defaultParams: Params = [
  "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
  "a396f583-b8a5-4542-bd1a-81aa45c6fca4",
];

const firstCategory = new CategoryModel({
  depthLevel: 0,
  icon: "icon",
  id: "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
  name: "Work",
  owner: OwnerType.USER,
  ownerId: "c2094eea-4032-48c1-b775-1d54d67897bd",
  parentId: undefined,
});

const secondCategory = new CategoryModel({
  depthLevel: 0,
  icon: "icon",
  id: "a396f583-b8a5-4542-bd1a-81aa45c6fca4",
  name: "Salary",
  owner: OwnerType.USER,
  ownerId: "c2094eea-4032-48c1-b775-1d54d67897bd",
  parentId: "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
});

// endregion mocks

// region spies

const getCacheSpy = jest.spyOn(cache, "get");
const setCacheSpy = jest.spyOn(cache, "set");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Params) {
  return getCategories(params ?? defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    get: getCacheSpy,
    set: setCacheSpy,
  },
  financialCategoryDatasource: jest.mocked(
    datasourcesMocks.financialCategoryDatasource,
  ),
};

const mocks = {
  defaultParams,
  firstCategory,
  secondCategory,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
