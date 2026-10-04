import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache from "@infrastructure/cache";

import updateAccount, { Params } from "../updateAccount";

const defaultParams: Params = {
  id: "acc-uuid",
  name: "Updated Acc",
};

const datasourceSpy = jest.mocked(datasourcesMocks.financialAccountDatasource);
datasourceSpy.updateAccount.mockResolvedValue(undefined);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return updateAccount(defaultParams, datasourcesMocks);
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
