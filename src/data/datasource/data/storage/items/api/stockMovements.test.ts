import { apiItemMock } from "@data/models/stock/mocks/StockModel.mocks";
import {
  ApiBusinessError,
  GenericError,
  StockLotAlreadyOpen,
  StockNotEnoughQuantity,
} from "@domain/entities/errors";
import { formatDay } from "@domain/entities/stock/stockDay";
import { api } from "@infrastructure/api";

import {
  createStockMovement,
  getOwnerChangePreview,
  getStockMovements,
  suggestStockItems,
} from "./stockMovements";

// The device day (the tests run in any time zone).
const TODAY = formatDay(new Date());

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const getSpy = jest.mocked(api.get);
const postSpy = jest.mocked(api.post);

const apiMovement = {
  createdAt: "2026-11-10T12:00:00.000Z",
  id: "m",
  lotId: "l",
  note: null,
  quantity: 1,
  reason: "PURCHASE",
  type: "ENTRY",
  user: { id: "u", name: "Ana" },
};

describe("createStockMovement", () => {
  it("SHOULD POST the movement with calendar days and the device day AND return the item and the movements", async () => {
    postSpy.mockResolvedValueOnce({
      item: apiItemMock,
      movements: [apiMovement],
    });

    const result = await createStockMovement({
      expirationDate: new Date(2026, 11, 1),
      itemId: "item-id",
      note: "n",
      purchaseDate: new Date(2026, 10, 9),
      quantity: 2,
      reason: "PURCHASE",
      type: "ENTRY",
    });

    expect(postSpy).toHaveBeenCalledWith("/v1/stock/items/item-id/movements", {
      countedQuantity: undefined,
      expirationDate: "2026-12-01",
      lotId: undefined,
      note: "n",
      purchaseDate: "2026-11-09",
      quantity: 2,
      reason: "PURCHASE",
      today: TODAY,
      type: "ENTRY",
    });
    expect(result.item.id).toBe(apiItemMock.id);
    expect(result.movements[0]).toMatchObject({
      type: "ENTRY",
      user: { name: "Ana" },
    });
  });

  it.each([
    ["Not enough quantity", StockNotEnoughQuantity],
    ["Lot is already open", StockLotAlreadyOpen],
  ])(
    "SHOULD map the 409 '%s' to its business error",
    async (message, expected) => {
      postSpy.mockRejectedValueOnce(new ApiBusinessError(message, 409));

      await expect(
        createStockMovement({ itemId: "i", quantity: 1, type: "CONSUME" }),
      ).rejects.toBeInstanceOf(expected);
    },
  );

  it("SHOULD wrap any other failure in GenericError with the item id only", async () => {
    postSpy.mockRejectedValueOnce(new ApiBusinessError("Boom", 500));

    const error = await createStockMovement({
      itemId: "i",
      type: "OPEN",
    }).catch((caught) => caught);

    expect(error).toBeInstanceOf(GenericError);
    expect(error).toHaveProperty("context.itemId", "i");
  });
});

describe("getStockMovements", () => {
  it("SHOULD GET a page, with and without a cursor", async () => {
    getSpy.mockResolvedValueOnce({ items: [apiMovement], nextCursor: "next" });
    getSpy.mockResolvedValueOnce({ items: [], nextCursor: null });

    const first = await getStockMovements({ itemId: "item-id" });
    const last = await getStockMovements({ cursor: "a b", itemId: "item-id" });

    expect(getSpy).toHaveBeenNthCalledWith(
      1,
      "/v1/stock/items/item-id/movements",
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      2,
      "/v1/stock/items/item-id/movements?cursor=a%20b",
    );
    expect(first.nextCursor).toBe("next");
    expect(last.nextCursor).toBeUndefined();
  });

  it("SHOULD wrap failures", async () => {
    getSpy.mockRejectedValueOnce(new Error("x"));

    await expect(getStockMovements({ itemId: "i" })).rejects.toBeInstanceOf(
      GenericError,
    );
  });
});

describe("getOwnerChangePreview / suggestStockItems", () => {
  it("SHOULD GET the preview of the move", async () => {
    getSpy.mockResolvedValueOnce({
      category: { from: "Dairy", to: null },
      location: { from: null, to: null },
    });

    const preview = await getOwnerChangePreview({
      itemId: "i",
      owner: "FAMILY",
      ownerId: "f",
    });

    expect(getSpy).toHaveBeenCalledWith(
      "/v1/stock/items/i/owner-change-preview?owner=FAMILY&ownerId=f",
    );
    expect(preview.category).toEqual({ from: "Dairy", to: undefined });
  });

  it("SHOULD GET the suggestions of the typed name", async () => {
    getSpy.mockResolvedValueOnce({
      items: [
        {
          brand: null,
          description: "Milk",
          id: "s",
          quantity: 1,
          score: 0.7,
          unit: "liter",
        },
      ],
    });

    const items = await suggestStockItems({
      owner: "USER",
      ownerId: "u",
      q: "mil k",
    });

    expect(getSpy).toHaveBeenCalledWith(
      "/v1/stock/items/suggestions?owner=USER&ownerId=u&q=mil%20k",
    );
    expect(items[0]).toMatchObject({ description: "Milk", score: 0.7 });
  });

  it("SHOULD wrap failures of both", async () => {
    getSpy.mockRejectedValue(new Error("x"));

    await expect(
      getOwnerChangePreview({ itemId: "i", owner: "USER", ownerId: "u" }),
    ).rejects.toBeInstanceOf(GenericError);
    await expect(
      suggestStockItems({ owner: "USER", ownerId: "u", q: "ab" }),
    ).rejects.toBeInstanceOf(GenericError);
    getSpy.mockReset();
  });
});
