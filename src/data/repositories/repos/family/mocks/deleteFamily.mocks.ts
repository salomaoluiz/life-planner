import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache from "@infrastructure/cache";

import deleteFamily, { Params } from "../deleteFamily";

// region mocks
const defaultParams: Params = "d5105d6d-99d5-4d41-b92e-ac95e996b8b4";

// endregion mocks

// region spies
const invalidateCacheSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Params) {
  return deleteFamily(params ?? defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  familyDatasource: jest.mocked(datasourcesMocks.familyDatasource),
};

const mocks = {
  defaultParams,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
