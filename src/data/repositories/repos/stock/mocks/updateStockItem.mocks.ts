import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import cache from "@infrastructure/cache";

import updateStockItem, { Params } from "../updateStockItem";

// region mocks
const defaultParams: Params = {
  barcode: "1234567890123",
  brand: "Some Brand",
  description: "Some Description",
  expirationDate: new Date(),
  id: "4ee21a41-7c0d-40f1-9291-9b0a73e89f2a",
  notes: "Some Notes",
  openingDate: new Date(),
  owner: StockOwners.FAMILY,
  ownerId: "1dcc732e-8886-4a68-b669-ded3f3809c20",
  purchaseDate: new Date(),
  quantity: 10,
  unit: StockUnits.GRAM,
};

// endregion mocks

// region spies
const invalidateCacheSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return updateStockItem({ ...defaultParams, ...params }, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  stockDatasource: jest.mocked(datasourcesMocks.stockDatasource),
};

const mocks = {
  defaultParams,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
