import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache from "@infrastructure/cache";

import deleteCategory, { Params } from "../deleteCategory";

const defaultParams: Params = {
  id: "cat-uuid",
  ownerId: "user-id",
};

const datasourceSpy = jest.mocked(datasourcesMocks.financialCategoryDatasource);
datasourceSpy.deleteCategory.mockResolvedValue(undefined);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return deleteCategory(defaultParams, datasourcesMocks);
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
