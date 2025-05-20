import StockModel from "@data/models/stock/StockModel";
import { GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getStockItems.mocks";

it("SHOULD call the supabase to get all stock items of the owner provided", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  await setup();

  expect(spies.supabase.from).toHaveBeenCalledTimes(1);
  expect(spies.supabase.from).toHaveBeenCalledWith("storage_items");
  expect(spies.supabase.select).toHaveBeenCalledTimes(1);
  expect(spies.supabase.select).toHaveBeenCalledWith();
  expect(spies.supabase.eq).toHaveBeenCalledTimes(1);
  expect(spies.supabase.eq).toHaveBeenCalledWith(
    "owner_id",
    mocks.defaultParams,
  );
  expect(spies.supabase.then).toHaveBeenCalledTimes(1);
  expect(spies.supabase.then).toHaveBeenCalledWith();
});

it("SHOULD return the stock items from the supabase", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.success.response);

  const response = await setup();

  expect(response).toEqual(
    mocks.success.response.data.map((stock) => StockModel.fromJSON(stock)),
  );
});

it("SHOULD throw an error if the supabase returns an error", async () => {
  spies.supabase.then.mockResolvedValueOnce(mocks.errors.unknown);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "StockDatasource - getStockItems",
    error: mocks.errors.unknown.error,
    ownerId: mocks.defaultParams,
  });
});
