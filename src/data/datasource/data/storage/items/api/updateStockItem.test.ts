import { ApiBusinessError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/updateStockItem.mocks";

it("SHOULD PATCH only the defined fields (dates as ISO strings)", async () => {
  await setup({
    id: mocks.itemId,
    openingDate: new Date("2026-10-04T08:00:00.000Z"),
    quantity: 1,
  });

  expect(spies.patch).toHaveBeenCalledWith(`/v1/stock/items/${mocks.itemId}`, {
    barcode: undefined,
    brand: undefined,
    description: undefined,
    expirationDate: undefined,
    notes: undefined,
    openingDate: "2026-10-04T08:00:00.000Z",
    purchaseDate: undefined,
    quantity: 1,
    unit: undefined,
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
  await setup({ id: mocks.itemId, ownerId: "family-id", quantity: 3 });

  const [, body] = spies.patch.mock.calls[0];
  expect(body).not.toHaveProperty("ownerId");
  expect(body).not.toHaveProperty("owner");
  expect(body).toHaveProperty("quantity", 3);
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
    quantity: 1,
  });

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    datasource: "StockDatasource - updateStockItem",
    error: apiError,
    id: mocks.itemId,
  });
});
