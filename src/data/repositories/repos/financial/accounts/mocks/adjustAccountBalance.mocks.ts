import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache from "@infrastructure/cache";

import adjustAccountBalance, { Params } from "../adjustAccountBalance";

const defaultParams: Params = { balance: 120, id: "acc-uuid" };

const datasourceSpy = jest.mocked(datasourcesMocks.financialAccountDatasource);
datasourceSpy.adjustAccountBalance.mockResolvedValue(undefined);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return adjustAccountBalance(defaultParams, datasourcesMocks);
}

const spies = {
  cache: { invalidate: invalidateCacheSpy },
  financialAccountDatasource: datasourceSpy,
};
const mocks = { defaultParams };

export { mocks, setup, spies };
