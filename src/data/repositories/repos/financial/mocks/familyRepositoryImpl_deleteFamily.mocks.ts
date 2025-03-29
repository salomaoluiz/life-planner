import { datasourcesMocks } from "@data/datasource/mocks";
import cache from "@infrastructure/cache";

import transactionRepositoryImpl from "../transactionRepositoryImpl";

// region mocks

// endregion mocks

// region spies

const deleteFamilySpy = jest.spyOn(
  datasourcesMocks.familyDatasource,
  "deleteFamily",
);
const invalidateSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return transactionRepositoryImpl(datasourcesMocks).deleteFamily("1234");
}

const spies = {
  cache: {
    invalidate: invalidateSpy,
  },
  deleteFamily: deleteFamilySpy,
};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
