import { GenericError } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import { purchaseApiDatasource as datasource } from "./purchases";

jest.mock("@infrastructure/api", () => ({
  api: {
    delete: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const spies = {
  delete: jest.mocked(api.delete),
  get: jest.mocked(api.get),
  patch: jest.mocked(api.patch),
  post: jest.mocked(api.post),
  put: jest.mocked(api.put),
};
const purchase = {
  currency: "BRL",
  id: "p1",
  lastActivityAt: "t",
  listId: "l1",
  marketId: "m1",
  purchaseDate: "2026-11-18",
  status: "OPEN",
};
const row = {
  checkedAt: "t",
  description: "Rice",
  id: "r1",
  state: "IN_CART",
  unknownPrice: false,
};

beforeEach(() => jest.resetAllMocks());

describe("reads", () => {
  it("SHOULD read the markets, a purchase, the pending ones, a page of a list AND the prices", async () => {
    spies.get.mockResolvedValueOnce({
      items: [
        { id: "m", name: "Bom", owner: "USER", ownerId: "u", status: "ACTIVE" },
      ],
    });
    expect(await datasource.getMarkets({ ownerId: "u" })).toHaveLength(1);
    expect(spies.get).toHaveBeenLastCalledWith("/v1/stock/markets?ownerId=u");
    spies.get.mockResolvedValueOnce({ items: [] });
    await datasource.getMarkets({});
    expect(spies.get).toHaveBeenLastCalledWith("/v1/stock/markets");

    spies.get.mockResolvedValueOnce({
      cart: { count: 0, totalCents: 0, unpricedCount: 0 },
      forecastCents: 0,
      otherCarts: [],
      purchase,
      remaining: { count: 0, estimatedCents: 0, pricedCount: 0 },
      rows: [row],
    });
    expect((await datasource.getPurchase("p1")).rows).toHaveLength(1);

    spies.get.mockResolvedValueOnce({ items: [] });
    expect(await datasource.getPendingPurchases()).toEqual([]);
    expect(spies.get).toHaveBeenLastCalledWith("/v1/stock/purchases/pending");

    spies.get.mockResolvedValueOnce({ items: [purchase], nextCursor: "c" });
    await datasource.getListPurchases({
      closed: true,
      cursor: "x",
      listId: "l1",
    });
    expect(spies.get).toHaveBeenLastCalledWith(
      "/v1/stock/shopping-lists/l1/purchases?status=CLOSED&cursor=x",
    );
    spies.get.mockResolvedValueOnce({ items: [] });
    await datasource.getListPurchases({ listId: "l1" });
    expect(spies.get).toHaveBeenLastCalledWith(
      "/v1/stock/shopping-lists/l1/purchases?status=OPEN%2CENDED",
    );

    spies.get.mockResolvedValueOnce({ items: [] });
    await datasource.getItemPrices({ cursor: "c", itemId: "i", marketId: "m" });
    expect(spies.get).toHaveBeenLastCalledWith(
      "/v1/stock/items/i/prices?marketId=m&cursor=c",
    );
    spies.get.mockResolvedValueOnce({ items: [] });
    await datasource.getItemPrices({ itemId: "i" });
    expect(spies.get).toHaveBeenLastCalledWith("/v1/stock/items/i/prices");

    spies.get.mockResolvedValueOnce({});
    await datasource.getClosePreview({ id: "p1", receiptTotalCents: 1000 });
    expect(spies.get).toHaveBeenLastCalledWith(
      "/v1/stock/purchases/p1/close-preview?receiptTotalCents=1000",
    );
    spies.get.mockResolvedValueOnce({});
    await datasource.getClosePreview({ id: "p1" });
    expect(spies.get).toHaveBeenLastCalledWith(
      "/v1/stock/purchases/p1/close-preview",
    );
  });
});

describe("writes", () => {
  it("SHOULD send the idempotency key on the row, status AND close writes", async () => {
    spies.put.mockResolvedValue({ convertedToOutside: false, row });
    await datasource.upsertPurchaseRow({
      clientId: "k",
      purchaseId: "p1",
      quantity: 2,
      rowId: "r1",
    });
    expect(spies.put).toHaveBeenCalledWith(
      "/v1/stock/purchases/p1/rows/r1",
      { quantity: 2 },
      { "Idempotency-Key": "k" },
    );

    spies.delete.mockResolvedValue(undefined);
    await datasource.deletePurchaseRow({
      clientId: "k",
      purchaseId: "p1",
      rowId: "r1",
    });
    expect(spies.delete).toHaveBeenCalledWith(
      "/v1/stock/purchases/p1/rows/r1",
      undefined,
      { "Idempotency-Key": "k" },
    );
    await datasource.deletePurchaseRow({ purchaseId: "p1", rowId: "r1" });
    expect(spies.delete).toHaveBeenLastCalledWith(
      "/v1/stock/purchases/p1/rows/r1",
      undefined,
      undefined,
    );

    spies.post.mockResolvedValue(purchase);
    await datasource.changePurchaseStatus({
      action: "END",
      clientId: "k",
      id: "p1",
    });
    expect(spies.post).toHaveBeenLastCalledWith(
      "/v1/stock/purchases/p1/end",
      undefined,
      {
        "Idempotency-Key": "k",
      },
    );
    await datasource.changePurchaseStatus({ action: "REOPEN", id: "p1" });
    expect(spies.post).toHaveBeenLastCalledWith(
      "/v1/stock/purchases/p1/reopen",
      undefined,
      undefined,
    );

    spies.post.mockResolvedValue({
      list: { removedRows: 0, updatedRows: 0 },
      purchase,
      stock: { lots: 1, newItems: 0 },
    });
    await datasource.closePurchase({
      clientId: "k",
      date: "2026-11-18",
      id: "p1",
      receiptTotalCents: 1000,
      rows: [],
    });
    expect(spies.post).toHaveBeenLastCalledWith(
      "/v1/stock/purchases/p1/close",
      { date: "2026-11-18", receiptTotalCents: 1000, rows: [] },
      { "Idempotency-Key": "k" },
    );
  });

  it("SHOULD start, merge, edit a closed purchase, create a market AND take or release the lock", async () => {
    spies.post.mockResolvedValue(purchase);
    await datasource.startPurchase({
      id: "p1",
      listId: "l1",
      marketId: "m1",
      purchaseDate: "2026-11-18",
    });
    expect(spies.post).toHaveBeenLastCalledWith(
      "/v1/stock/purchases",
      expect.objectContaining({ id: "p1" }),
    );
    await datasource.mergePurchase({ id: "a", targetId: "b" });
    expect(spies.post).toHaveBeenLastCalledWith(
      "/v1/stock/purchases/a/merge-into/b",
    );

    spies.patch.mockResolvedValue(purchase);
    await datasource.updateClosedPurchase({ id: "p1", receiptTotalCents: 900 });
    expect(spies.patch).toHaveBeenCalledWith("/v1/stock/purchases/p1", {
      receiptTotalCents: 900,
    });

    spies.post.mockResolvedValueOnce({
      id: "m",
      name: "Bom",
      owner: "USER",
      ownerId: "u",
      status: "ACTIVE",
    });
    expect(
      (
        await datasource.createMarket({
          name: "Bom",
          owner: "USER",
          ownerId: "u",
        })
      ).id,
    ).toBe("m");

    spies.post.mockResolvedValue(undefined);
    await datasource.closingLock({ id: "p1" });
    expect(spies.post).toHaveBeenLastCalledWith(
      "/v1/stock/purchases/p1/closing",
    );
    await datasource.closingLock({ id: "p1", release: true });
    expect(spies.delete).toHaveBeenLastCalledWith(
      "/v1/stock/purchases/p1/closing",
    );
  });

  it("SHOULD return the kept rows of a deleted closed purchase", async () => {
    spies.delete.mockResolvedValueOnce({
      keptRows: [{ description: "Rice", rowId: "r1" }],
    });
    expect(await datasource.deleteClosedPurchase("p1")).toEqual([
      { description: "Rice", rowId: "r1" },
    ]);
    spies.delete.mockResolvedValueOnce({});
    expect(await datasource.deleteClosedPurchase("p1")).toEqual([]);
  });
});

describe("addPurchaseRowByCode (spec 121)", () => {
  it("SHOULD post the code WITH the idempotency key AND parse the row and its source", async () => {
    spies.post.mockResolvedValue({ row, source: "OPEN_FOOD_FACTS" });

    const result = await datasource.addPurchaseRowByCode({
      clientId: "k",
      code: "7891000100103",
      purchaseId: "p1",
    });

    expect(spies.post).toHaveBeenCalledWith(
      "/v1/stock/purchases/p1/rows/by-code",
      { code: "7891000100103" },
      { "Idempotency-Key": "k" },
    );
    expect(result.source).toBe("OPEN_FOOD_FACTS");
    expect(result.row.id).toBe(row.id);
  });

  it("SHOULD wrap a failure in a GenericError", async () => {
    spies.post.mockRejectedValue(new Error("boom"));

    await expect(
      datasource.addPurchaseRowByCode({ code: "1", purchaseId: "p1" }),
    ).rejects.toBeInstanceOf(GenericError);
  });
});

describe("errors", () => {
  it("SHOULD wrap an unexpected failure in a GenericError carrying ids only", async () => {
    const calls: Array<() => Promise<unknown>> = [
      async () => datasource.getMarkets({}),
      async () => datasource.getPurchase("p"),
      async () => datasource.getPendingPurchases(),
      async () => datasource.getListPurchases({ listId: "l" }),
      async () => datasource.getItemPrices({ itemId: "i" }),
      async () => datasource.getClosePreview({ id: "p" }),
      async () => datasource.upsertPurchaseRow({ purchaseId: "p", rowId: "r" }),
      async () => datasource.deletePurchaseRow({ purchaseId: "p", rowId: "r" }),
      async () => datasource.changePurchaseStatus({ action: "END", id: "p" }),
      async () =>
        datasource.closePurchase({
          date: "d",
          id: "p",
          receiptTotalCents: 1,
          rows: [],
        }),
      async () =>
        datasource.startPurchase({
          id: "p",
          listId: "l",
          marketId: "m",
          purchaseDate: "d",
        }),
      async () => datasource.mergePurchase({ id: "a", targetId: "b" }),
      async () => datasource.updateClosedPurchase({ id: "p" }),
      async () =>
        datasource.createMarket({ name: "n", owner: "USER", ownerId: "u" }),
      async () => datasource.closingLock({ id: "p" }),
      async () => datasource.deleteClosedPurchase("p"),
    ];

    for (const call of calls) {
      for (const method of Object.values(spies)) {
        method.mockRejectedValue(new Error("boom"));
      }

      await expect(call()).rejects.toBeInstanceOf(GenericError);
    }
  });
});
