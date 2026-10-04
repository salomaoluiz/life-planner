import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache from "@infrastructure/cache";

import deleteAccount, { Params } from "../deleteAccount";

const defaultParams: Params = {
  id: "acc-uuid",
  ownerId: "user-id",
};

const datasourceSpy = jest.mocked(datasourcesMocks.financialAccountDatasource);
datasourceSpy.deleteAccount.mockResolvedValue(undefined);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return deleteAccount(defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  financialAccountDatasource: datasourceSpy,
};

const mocks = {
  defaultParams,
};

export { mocks, setup, spies };
