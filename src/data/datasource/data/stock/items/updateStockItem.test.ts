import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateStockItem.mocks";

it("SHOULD call the supabase to update a stock item", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("storage");
  expect(spies.supabase.upsert).toHaveBeenCalledWith({
    barcode: mocks.defaultParams.barcode,
    brand: mocks.defaultParams.brand,
    description: mocks.defaultParams.description,
    expirationDate: mocks.defaultParams.expirationDate,
    notes: mocks.defaultParams.notes,
    openingDate: mocks.defaultParams.openingDate,
    owner: mocks.defaultParams.owner,
    ownerId: mocks.defaultParams.ownerId,
    purchaseDate: mocks.defaultParams.purchaseDate,
    quantity: mocks.defaultParams.quantity,
    unit: mocks.defaultParams.unit,
  });
  expect(spies.supabase.upsert).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith("id", mocks.defaultParams.id);
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD throw a generic error if the supabase return an unknown error", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "StockDatasource - updateStockItem",
    error: mocks.errors.unknown.error,
    params: mocks.defaultParams,
  });
});
