import StockModel from "@data/models/stock/StockModel";
import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/createStockItem.mocks";

it("SHOULD call the supabase to create a new stock item", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("storage");
  expect(spies.supabase.upsert).toHaveBeenCalledTimes(1);
  expect(spies.supabase.upsert).toHaveBeenCalledWith({
    barcode: mocks.defaultParams.barcode,
    brand: mocks.defaultParams.brand,
    description: mocks.defaultParams.description,
    expiration_date: mocks.defaultParams.expirationDate,
    notes: mocks.defaultParams.notes,
    opening_date: mocks.defaultParams.openingDate,
    owner: mocks.defaultParams.owner,
    owner_id: mocks.defaultParams.ownerId,
    purchase_date: mocks.defaultParams.purchaseDate,
    quantity: mocks.defaultParams.quantity,
    unit: mocks.defaultParams.unit,
  });
  expect(spies.supabase.select).toHaveBeenCalledTimes(1);
  expect(spies.supabase.select).toHaveBeenCalledWith();
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD return a stock item model WHEN the response is success", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  const result = await setup();

  expect(result).toBeInstanceOf(StockModel);
  expect(result).toEqual(StockModel.fromJSON(mocks.success.response.data[0]));
});

it("SHOULD throw a generic error if the supabase return an unknown error", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "StockDatasource - createStockItem",
    error: mocks.errors.unknown.error,
    params: mocks.defaultParams,
  });
});
