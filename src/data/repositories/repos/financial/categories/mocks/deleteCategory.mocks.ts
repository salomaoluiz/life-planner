import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache from "@infrastructure/cache";

import deleteCategory, { Params } from "../deleteCategory";

// region mocks
const defaultParams: Params = {
  id: "1b49bd28-f5c2-4112-8cdf-7aaf12b552c0",
  ownerId: "b8fdda1d-d85f-4ac7-9fae-ca8fb7630625",
};

// endregion mocks

// region spies
const invalidateCacheSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Params) {
  return deleteCategory(params ?? defaultParams, datasourcesMocks);
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
