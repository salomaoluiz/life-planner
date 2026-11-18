import { ApiBusinessError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateStockItem.mocks";

it("SHOULD PATCH only the defined fields AND send null to clear an optional", async () => {
  await setup({
    categoryId: null,
    id: mocks.itemId,
    minQuantity: 0.3,
    stockOnly: false,
  });

  expect(spies.patch).toHaveBeenCalledWith(`/v1/stock/items/${mocks.itemId}`, {
    barcode: undefined,
    brand: undefined,
    categoryId: null,
    description: undefined,
    idealQuantity: undefined,
    locationId: undefined,
    minQuantity: 0.3,
    notes: undefined,
    openedShelfLifeDays: undefined,
    stockOnly: false,
    unit: undefined,
    warnDaysClosed: undefined,
    warnDaysOpened: undefined,
  });
});

it("SHOULD send owner and ownerId together", async () => {
  await setup({ id: mocks.itemId, owner: "FAMILY", ownerId: "family-id" });

  expect(spies.patch).toHaveBeenCalledWith(
    `/v1/stock/items/${mocks.itemId}`,
    expect.objectContaining({ owner: "FAMILY", ownerId: "family-id" }),
  );
});

it("SHOULD NOT send ownerId alone (the API rejects a half move)", async () => {
  await setup({ description: "x", id: mocks.itemId, ownerId: "family-id" });

  const [, body] = spies.patch.mock.calls[0];
  expect(body).not.toHaveProperty("ownerId");
  expect(body).not.toHaveProperty("owner");
  expect(body).toHaveProperty("description", "x");
});

it("SHOULD NOT call the API WHEN there is nothing to update", async () => {
  await setup({ id: mocks.itemId, ownerId: "family-id" });

  expect(spies.patch).not.toHaveBeenCalled();
});

it("SHOULD wrap an API 404 in GenericError with the id only", async () => {
  const apiError = new ApiBusinessError("Not Found", 404);
  spies.patch.mockRejectedValueOnce(apiError);

  const error = await setupThrowable({
    id: mocks.itemId,
    notes: "secret",
  });

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "StockDatasource - updateStockItem",
    error: apiError,
    id: mocks.itemId,
  });
});
