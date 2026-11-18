import StockModel from "@data/models/stock/StockModel";
import { ApiBusinessError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createStockItem.mocks";

it("SHOULD POST /v1/stock/items with calendar days AND return the created StockModel", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiItem);

  const result = await setup();

  expect(spies.post).toHaveBeenCalledWith("/v1/stock/items", {
    barcode: "7890000000001",
    brand: undefined,
    categoryId: "category-id",
    description: "Rice",
    expirationDate: "2027-03-01",
    idealQuantity: 5,
    locationId: "location-id",
    minQuantity: 1,
    notes: "private note",
    openedShelfLifeDays: 5,
    owner: "USER",
    ownerId: mocks.defaultParams.ownerId,
    purchaseDate: "2026-11-09",
    quantity: 2.5,
    stockOnly: false,
    unit: "kilogram",
    warnDaysClosed: 7,
    warnDaysOpened: 1,
  });
  expect(result).toEqual(StockModel.fromJSON(mocks.apiItem));
});

it("SHOULD leave the dates out WHEN there are none", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiItem);

  await setup({
    ...mocks.defaultParams,
    expirationDate: undefined,
    purchaseDate: undefined,
  });

  expect(spies.post.mock.calls[0][1]).toMatchObject({
    expirationDate: undefined,
    purchaseDate: undefined,
  });
});

it("SHOULD wrap an API 403 in GenericError WITHOUT the notes or the body in the context", async () => {
  const apiError = new ApiBusinessError("Forbidden", 403);
  spies.post.mockRejectedValueOnce(apiError);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "StockDatasource - createStockItem",
    error: apiError,
    ownerId: mocks.defaultParams.ownerId,
  });
});
