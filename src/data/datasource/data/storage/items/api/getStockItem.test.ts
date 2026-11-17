import { apiItemMock } from "@data/models/stock/mocks/StockModel.mocks";
import StockModel from "@data/models/stock/StockModel";
import { ApiBusinessError, GenericError } from "@domain/entities/errors";
import { formatDay } from "@domain/entities/stock/stockDay";
import { api } from "@infrastructure/api";

import getStockItem from "./getStockItem";

// The device day (the tests run in any time zone).
const TODAY = formatDay(new Date());

jest.mock("@infrastructure/api", () => ({ api: { get: jest.fn() } }));

const getSpy = jest.mocked(api.get);

it("SHOULD GET the detail of the item with the device day AND return the StockModel with its lots", async () => {
  getSpy.mockResolvedValueOnce(apiItemMock);

  const result = await getStockItem("item-id");

  expect(getSpy).toHaveBeenCalledWith(`/v1/stock/items/item-id?today=${TODAY}`);
  expect(result).toEqual(StockModel.fromJSON(apiItemMock));
  expect(result.lots).toHaveLength(1);
});

it("SHOULD wrap an API failure in GenericError with the id only", async () => {
  const apiError = new ApiBusinessError("Not Found", 404);

  getSpy.mockRejectedValueOnce(apiError);

  const error = await getStockItem("item-id").catch((caught) => caught);

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "StockDatasource - getStockItem",
    error: apiError,
    id: "item-id",
  });
});
