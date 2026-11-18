import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import {
  apiItemMinimalMock,
  apiItemMock,
} from "@data/models/stock/mocks/StockModel.mocks";
import StockModel from "@data/models/stock/StockModel";
import StockMovementModel from "@data/models/stock/StockMovementModel";
import cache from "@infrastructure/cache";

const detailModel = StockModel.fromJSON(apiItemMock);
const listModel = StockModel.fromJSON({ ...apiItemMock, lots: undefined });
const minimalModel = StockModel.fromJSON(apiItemMinimalMock);
const movementModel = StockMovementModel.fromJSON({
  createdAt: "2026-11-10T12:00:00.000Z",
  id: "m",
  lotId: "l",
  quantity: 1,
  type: "ENTRY",
});

const spies = {
  cache: {
    get: jest.spyOn(cache, "get"),
    invalidate: jest.spyOn(cache, "invalidate"),
    set: jest.spyOn(cache, "set"),
  },
  datasource: jest.mocked(datasourcesMocks.stockDatasource),
};

beforeEach(() => {
  jest.clearAllMocks();
  spies.cache.get.mockReturnValue(null);
});

const mocks = {
  datasources: datasourcesMocks,
  detailModel,
  listModel,
  minimalModel,
  movementModel,
};

export { mocks, spies };
