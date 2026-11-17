import StockModel from "@data/models/stock/StockModel";
import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
} from "@domain/entities/errors";
import { formatDay } from "@domain/entities/stock/stockDay";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getStockItems.mocks";

// The device day (the tests run in any time zone).
const TODAY = formatDay(new Date());

it("SHOULD GET /v1/stock/items filtered by the owner AND return StockModels", async () => {
  spies.get.mockResolvedValueOnce(mocks.apiItems);

  const result = await setup();

  expect(spies.get).toHaveBeenCalledWith(
    `/v1/stock/items?ownerId=${mocks.ownerId}&today=${TODAY}`,
  );
  expect(result).toEqual([StockModel.fromJSON(mocks.apiItems[0])]);
  expect(result[0].brand).toBeUndefined();
  expect(result[0].nearestExpiration).toEqual(new Date(2026, 9, 20));
});

it("SHOULD return an empty list WHEN the API returns []", async () => {
  spies.get.mockResolvedValueOnce([]);

  expect(await setup()).toEqual([]);
});

it("SHOULD NOT call the API WHEN the ownerId is empty", async () => {
  expect(await setup("")).toEqual([]);
  expect(spies.get).not.toHaveBeenCalled();
});

it("SHOULD re-throw ConnectivityError", async () => {
  const error = new ConnectivityError();
  spies.get.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap an API 400 in GenericError with the owner id only", async () => {
  const apiError = new ApiBusinessError("Validation Failed", 400);
  spies.get.mockRejectedValueOnce(apiError);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "StockDatasource - getStockItems",
    error: apiError,
    ownerId: mocks.ownerId,
  });
});
