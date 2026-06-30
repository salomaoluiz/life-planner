import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache from "@infrastructure/cache";

import updateCategory, { Params } from "../updateCategory";

const defaultParams: Params = {
  depthLevel: 1,
  icon: "icon-new",
  id: "cat-uuid",
  name: "Category New",
  owner: OwnerType.USER,
  ownerId: "user-id",
  parentId: "parent-uuid",
};

const datasourceSpy = jest.mocked(datasourcesMocks.financialCategoryDatasource);
datasourceSpy.updateCategory.mockResolvedValue(undefined);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return updateCategory(defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  financialCategoryDatasource: datasourceSpy,
};

const mocks = {
  defaultParams,
};

export { mocks, setup, spies };
