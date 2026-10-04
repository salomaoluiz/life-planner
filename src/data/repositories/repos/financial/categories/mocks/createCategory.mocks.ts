import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import CategoryModel from "@data/models/financial/CategoryModel";
import { CategoryType } from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache from "@infrastructure/cache";

import createCategory, { Params } from "../createCategory";

const defaultParams: Params = {
  depthLevel: 0,
  icon: "icon",
  iconColor: "black",
  name: "Category",
  owner: OwnerType.USER,
  ownerId: "user-id",
  parentId: undefined,
  type: CategoryType.EXPENSE,
};

const categoryModelMock = new CategoryModel({
  depthLevel: 0,
  icon: "icon",
  iconColor: "black",
  id: "cat-uuid",
  name: "Category",
  owner: "USER",
  ownerId: "user-id",
  parentId: undefined,
  type: "EXPENSE",
});

const datasourceSpy = jest.mocked(datasourcesMocks.financialCategoryDatasource);
datasourceSpy.createCategory.mockResolvedValue(categoryModelMock);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return createCategory(defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  financialCategoryDatasource: datasourceSpy,
};

const mocks = {
  categoryModel: categoryModelMock,
  defaultParams,
};

export { mocks, setup, spies };
