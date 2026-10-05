import StockModel from "@data/models/stock/StockModel";
import { ApiBusinessError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createStockItem.mocks";

it("SHOULD POST /v1/stock/items with ISO dates AND return the created StockModel", async () => {
  spies.post.mockResolvedValueOnce(mocks.apiItem);

  const result = await setup();

  expect(spies.post).toHaveBeenCalledWith("/v1/stock/items", {
    barcode: "7890000000001",
    brand: undefined,
    description: "Rice",
    expirationDate: "2027-03-01T00:00:00.000Z",
    notes: "private note",
    openingDate: undefined,
    owner: "USER",
    ownerId: mocks.defaultParams.ownerId,
    purchaseDate: undefined,
    quantity: 2,
    unit: "kilogram",
  });
  expect(result).toEqual(StockModel.fromJSON(mocks.apiItem));
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
