import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import StockModel from "@data/models/stock/StockModel";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import cache from "@infrastructure/cache";

import getStockItems, { Params } from "../getStockItems";

// region mocks
const defaultParams: Params = "40351436-c148-49bf-9235-dd68fae9647e";

const firstStockItem = new StockModel({
  barcode: "1234567890123",
  brand: "Brand A",
  description: "Product A",
  expirationDate: new Date(),
  id: "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
  notes: "Note A",
  openingDate: new Date(),
  owner: StockOwners.FAMILY,
  ownerId: "88bdbf72-3558-4bd3-864e-c5e72786f5c3",
  purchaseDate: new Date(),
  quantity: 10,
  status: "active",
  unit: StockUnits.GRAM,
});

const secondStockItem = new StockModel({
  barcode: "1234567890123",
  brand: "Brand B",
  description: "Product B",
  expirationDate: new Date(),
  id: "a396f583-b8a5-4542-bd1a-81aa45c6fca4",
  notes: "Note B",
  openingDate: new Date(),
  owner: StockOwners.FAMILY,
  ownerId: "6bad0c6f-9329-4e64-b9be-ed15044badcf",
  purchaseDate: new Date(),
  quantity: 20,
  status: "active",
  unit: StockUnits.GRAM,
});

// endregion mocks

// region spies

const getCacheSpy = jest.spyOn(cache, "get");
const setCacheSpy = jest.spyOn(cache, "set");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Params) {
  return getStockItems(params ?? defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    get: getCacheSpy,
    set: setCacheSpy,
  },
  stockDatasource: jest.mocked(datasourcesMocks.stockDatasource),
};

const mocks = {
  defaultParams,
  firstStockItem,
  secondStockItem,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
