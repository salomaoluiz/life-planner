import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import CategoryModel from "@data/models/financial/CategoryModel";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache from "@infrastructure/cache";

import createCategory, { Params } from "../createCategory";

// region mocks
const defaultParams: Params = {
  depthLevel: 1,
  icon: "some-icon",
  name: "Some Category",
  owner: OwnerType.FAMILY,
  ownerId: "1dcc732e-8886-4a68-b669-ded3f3809c20",
  parentId: undefined,
};

const categoryModelMock = new CategoryModel({
  depthLevel: defaultParams.depthLevel,
  icon: defaultParams.icon,
  id: "1dcc732e-8886-4a68-b669-ded3f3809c20",
  name: defaultParams.name,
  owner: defaultParams.owner,
  ownerId: defaultParams.ownerId,
  parentId: defaultParams.parentId,
});

// endregion mocks

// region spies
const financialCategoryDatasourceSpy = jest.mocked(
  datasourcesMocks.financialCategoryDatasource,
);
financialCategoryDatasourceSpy.createCategory.mockResolvedValue(
  categoryModelMock,
);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return createCategory({ ...defaultParams, ...params }, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  financialCategoryDatasource: financialCategoryDatasourceSpy,
};

const mocks = {
  categoryModel: categoryModelMock,
  defaultParams,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
