import { apiItemMock } from "@data/models/stock/mocks/StockModel.mocks";
import {
  ApiBusinessError,
  GenericError,
  StockUndoTooLate,
} from "@domain/entities/errors";
import { formatDay } from "@domain/entities/stock/stockDay";
import { api } from "@infrastructure/api";

import {
  getFrequentStockItems,
  getStockLocation,
  setStockGestureExpiration,
  undoStockGesture,
} from "./stockQuick";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const getSpy = jest.mocked(api.get);
const postSpy = jest.mocked(api.post);

describe("getFrequentStockItems", () => {
  it("SHOULD read the frequent items with the limit", async () => {
    getSpy.mockResolvedValueOnce({ items: [apiItemMock] });

    const rows = await getFrequentStockItems(5);

    expect(getSpy).toHaveBeenCalledWith("/v1/stock/items/frequent?limit=5");
    expect(rows[0].id).toBe(apiItemMock.id);
  });

  it("SHOULD hide a failure behind a GenericError", async () => {
    getSpy.mockRejectedValueOnce(new Error("boom"));

    await expect(getFrequentStockItems()).rejects.toThrow(GenericError);
  });
});

describe("getStockLocation", () => {
  it("SHOULD read the location with its owner", async () => {
    getSpy.mockResolvedValueOnce({
      id: "loc",
      itemCount: 3,
      name: "Pantry",
      owner: "USER",
      ownerId: "u",
      status: "ACTIVE",
    });

    expect(await getStockLocation("loc")).toMatchObject({
      itemCount: 3,
      name: "Pantry",
    });
    expect(getSpy).toHaveBeenCalledWith("/v1/stock/locations/loc");
  });
});

describe("undoStockGesture", () => {
  it("SHOULD post the gesture with the key AND map the 409 to StockUndoTooLate", async () => {
    postSpy.mockResolvedValueOnce({ item: apiItemMock });

    await undoStockGesture({ clientId: "key", gestureId: "g" });

    expect(postSpy).toHaveBeenCalledWith(
      "/v1/stock/movements/undo",
      { gestureId: "g" },
      { "Idempotency-Key": "key" },
    );

    postSpy.mockRejectedValueOnce(
      new ApiBusinessError("Não dá mais para desfazer", 409),
    );

    await expect(undoStockGesture({ gestureId: "g" })).rejects.toThrow(
      StockUndoTooLate,
    );
  });
});

describe("setStockGestureExpiration", () => {
  it("SHOULD post the chosen day for the gesture", async () => {
    postSpy.mockResolvedValueOnce({ item: apiItemMock });

    await setStockGestureExpiration({
      expirationDate: new Date(2026, 11, 5),
      gestureId: "g",
    });

    expect(postSpy).toHaveBeenCalledWith(
      "/v1/stock/movements/g/expiration",
      { expirationDate: "2026-12-05", today: formatDay(new Date()) },
      undefined,
    );
  });
});
