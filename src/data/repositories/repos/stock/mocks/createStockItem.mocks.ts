import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import StockModel from "@data/models/stock/StockModel";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import cache from "@infrastructure/cache";

import createStockItem, { Params } from "../createStockItem";

// region mocks
const defaultParams: Params = {
  barcode: "1234567890123",
  brand: "Some Brand",
  description: "Some Description",
  expirationDate: new Date(),
  notes: "Some Notes",
  openingDate: new Date(),
  owner: StockOwners.FAMILY,
  ownerId: "1dcc732e-8886-4a68-b669-ded3f3809c20",
  purchaseDate: new Date(),
  quantity: 10,
  unit: StockUnits.GRAM,
};

const transactionModelMock = new StockModel({
  barcode: "1234567890123",
  brand: "Some Brand",
  description: "Some Description",
  expirationDate: new Date(),
  id: "1dcc732e-8886-4a68-b669-ded3f3809c20",
  notes: "Some Notes",
  openingDate: new Date(),
  owner: StockOwners.FAMILY,
  ownerId: "1dcc732e-8886-4a68-b669-ded3f3809c20",
  purchaseDate: new Date(),
  quantity: 10,
  status: "active",
  unit: StockUnits.GRAM,
});

// endregion mocks

// region spies
const stockItemDatasourceSpy = jest.mocked(datasourcesMocks.stockDatasource);
stockItemDatasourceSpy.createStockItem.mockResolvedValue(transactionModelMock);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return createStockItem({ ...defaultParams, ...params }, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  stockItemDatasource: stockItemDatasourceSpy,
};

const mocks = {
  defaultParams,
  transactionModel: transactionModelMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
