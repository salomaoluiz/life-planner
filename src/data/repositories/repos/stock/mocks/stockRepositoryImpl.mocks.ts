import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";

import * as createStockItem from "../createStockItem";
import * as deleteStockItem from "../deleteStockItem";
import * as getStockItems from "../getStockItems";
import stockRepositoryImpl from "../stockRepositoryImpl";
import * as updateStockItem from "../updateStockItem";

// region mocks

// endregion mocks

// region spies

const createStockItemSpy = jest.spyOn(createStockItem, "default");
createStockItemSpy.mockResolvedValue("createStockItem response" as never);

const deleteStockItemSpy = jest.spyOn(deleteStockItem, "default");
deleteStockItemSpy.mockResolvedValue("deleteStockItem response" as never);

const getStockItemsSpy = jest.spyOn(getStockItems, "default");
getStockItemsSpy.mockResolvedValue("getStockItems response" as never);

const updateStockItemSpy = jest.spyOn(updateStockItem, "default");
updateStockItemSpy.mockResolvedValue("updateStockItem response" as never);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return stockRepositoryImpl(datasourcesMocks);
}

const spies = {
  createStockItem: createStockItemSpy,
  deleteStockItem: deleteStockItemSpy,
  getStockItems: getStockItemsSpy,
  updateStockItem: updateStockItemSpy,
};

const mocks = {
  datasources: datasourcesMocks,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
