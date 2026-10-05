import {
  ApiBusinessError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/deleteStockItem.mocks";

it("SHOULD DELETE /v1/stock/items/:id", async () => {
  await setup();

  expect(spies.delete).toHaveBeenCalledWith(`/v1/stock/items/${mocks.itemId}`);
});

it("SHOULD resolve with undefined on the empty 204 body", async () => {
  spies.delete.mockResolvedValueOnce(undefined);

  await expect(setup()).resolves.toBeUndefined();
});

it("SHOULD re-throw UserNotLoggedError (global 401 handler)", async () => {
  const error = new UserNotLoggedError();
  spies.delete.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
});

it("SHOULD wrap an API 404 in GenericError with the id", async () => {
  const apiError = new ApiBusinessError("Not Found", 404);
  spies.delete.mockRejectedValueOnce(apiError);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "StockDatasource - deleteStockItem",
    error: apiError,
    id: mocks.itemId,
  });
});
