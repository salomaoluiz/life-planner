import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache from "@infrastructure/cache";

import confirmTransaction, { Params } from "../confirmTransaction";

// region mocks
const defaultParams: Params = {
  date: "2026-10-24T00:00:00.000Z",
  id: "1b49bd28-f5c2-4112-8cdf-7aaf12b552c0",
  invoiceMonth: undefined,
  ownerId: "b8fdda1d-d85f-4ac7-9fae-ca8fb7630625",
  value: "99.90",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Params) {
  return confirmTransaction(params ?? defaultParams, datasourcesMocks);
}

const spies = {
  cache: { invalidate: jest.spyOn(cache, "invalidate") },
  financialTransactionDatasource: jest.mocked(
    datasourcesMocks.financialTransactionDatasource,
  ),
};
const mocks = { defaultParams };

export { mocks, setup, spies };
