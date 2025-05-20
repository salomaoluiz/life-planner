import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache from "@infrastructure/cache";

import updateCategory, { Params } from "../updateCategory";

// region mocks
const defaultParams: Params = {
  depthLevel: 0,
  icon: "icon",
  id: "5ac1e135-484c-4cd7-a315-2615380347ed",
  name: "Some Category",
  owner: OwnerType.USER,
  ownerId: "c0c411de-5d77-4754-b0de-548ae9d537bb",
  parentId: undefined,
};

// endregion mocks

// region spies
const invalidateCacheSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return updateCategory({ ...defaultParams, ...params }, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  financialCategoryDatasource: jest.mocked(
    datasourcesMocks.financialCategoryDatasource,
  ),
};

const mocks = {
  defaultParams,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
