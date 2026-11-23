import {
  PurchaseRowStates,
  PurchaseStatuses,
} from "@domain/entities/stock/PurchaseEntity";

import {
  parseClosedPurchase,
  parseClosePreview,
  parseItemPrices,
  parseListPurchases,
  parseMarket,
  parsePendingPurchases,
  parsePurchase,
  parsePurchaseRow,
  parsePurchaseRowResult,
  parsePurchaseView,
} from "./PurchaseModels";

const purchase = {
  accountId: null,
  closing: { at: "2026-11-18T10:00:00.000Z", by: "u" },
  creditCardId: "card",
  currency: "BRL",
  id: "p1",
  invoiceMonth: "2026-12",
  lastActivityAt: "2026-11-18T10:00:00.000Z",
  listId: "l1",
  marketId: "m1",
  purchaseDate: "2026-11-18",
  receiptTotalCents: 1000,
  splitId: null,
  startedBy: "u",
  status: "OPEN",
  transactionId: "t1",
};
const row = {
  checkedAt: "2026-11-18T10:00:00.000Z",
  checkedBy: { id: "u", name: "Ana" },
  description: "Rice",
  expirationDate: "2027-03-31",
  id: "r1",
  itemId: "i1",
  lastPrice: { date: "2026-10-21", unitPriceCents: 3640 },
  lineTotalCents: 4290,
  listRowId: "l-rice",
  priceChangePercent: 18,
  priceInput: "UNIT",
  quantity: 1,
  state: "IN_CART",
  unit: "unit",
  unitPriceCents: 4290,
  unknownPrice: false,
};

it("SHOULD parse a market with a null neighborhood as absent", () => {
  expect(
    parseMarket({
      id: "m",
      name: "Bom",
      neighborhood: null,
      owner: "USER",
      ownerId: "u",
      status: "ACTIVE",
    }),
  ).toEqual({
    id: "m",
    name: "Bom",
    neighborhood: undefined,
    owner: "USER",
    ownerId: "u",
    status: "ACTIVE",
  });
});

it("SHOULD parse a purchase (nulls become absent, the closing keeps its fields)", () => {
  expect(parsePurchase(purchase)).toMatchObject({
    accountId: undefined,
    closing: { at: "2026-11-18T10:00:00.000Z", by: "u" },
    creditCardId: "card",
    receiptTotalCents: 1000,
    status: PurchaseStatuses.OPEN,
    transactionId: "t1",
  });
  expect(parsePurchase({ ...purchase, closing: null }).closing).toBeUndefined();
});

it("SHOULD parse a row with its last price AND without one", () => {
  expect(parsePurchaseRow(row)).toMatchObject({
    lastPrice: { date: "2026-10-21", unitPriceCents: 3640 },
    priceChangePercent: 18,
    state: PurchaseRowStates.IN_CART,
    unknownPrice: false,
  });
  expect(
    parsePurchaseRow({
      ...row,
      lastPrice: null,
      priceChangePercent: null,
      unknownPrice: true,
    }),
  ).toMatchObject({
    lastPrice: undefined,
    priceChangePercent: undefined,
    unknownPrice: true,
  });
});

it("SHOULD parse the view, the row result AND the list pages (views and plain headers)", () => {
  const view = {
    cart: { count: 1, totalCents: 4290, unpricedCount: 0 },
    forecastCents: 5000,
    otherCarts: null,
    purchase,
    remaining: { count: 1, estimatedCents: 700, pricedCount: 1 },
    rows: [row],
  };

  expect(parsePurchaseView(view)).toMatchObject({
    forecastCents: 5000,
    otherCarts: [],
  });
  expect(parsePurchaseView({ ...view, rows: null }).rows).toEqual([]);
  expect(
    parsePurchaseRowResult({
      conflict: { purchaseId: "p2", userName: "Ana" },
      convertedToOutside: true,
      row,
    }),
  ).toMatchObject({ conflict: { userName: "Ana" }, convertedToOutside: true });
  expect(
    parsePurchaseRowResult({ conflict: null, row }).convertedToOutside,
  ).toBe(false);

  const page = parseListPurchases({
    items: [view, purchase],
    nextCursor: "abc",
  });

  expect("purchase" in page.items[0]).toBe(true);
  expect("purchase" in page.items[1]).toBe(false);
  expect(page.nextCursor).toBe("abc");
  expect(parseListPurchases({ nextCursor: null })).toEqual({
    items: [],
    nextCursor: undefined,
  });
});

it("SHOULD parse the pending purchases, the close preview AND the closed purchase", () => {
  expect(
    parsePendingPurchases({
      items: [
        {
          cartTotalCents: 1,
          checkedCount: 2,
          id: "p",
          lastActivityAt: "t",
          listId: "l",
          listName: "L",
          marketName: "M",
          status: "ENDED",
        },
      ],
    }),
  ).toHaveLength(1);
  expect(parsePendingPurchases({})).toEqual([]);

  const preview = parseClosePreview({
    expirations: [{ rowId: "r", suggestedDate: "2026-12-10" }],
    financeError: null,
    financeParts: [{ categoryId: null, kind: "ADJUSTMENT", valueCents: -100 }],
    missingPrices: ["r2"],
    needsDefaultFinanceCategory: true,
    newItems: [
      { description: "Candle", rowId: "r2", suggestion: null, unit: "unit" },
    ],
    unknownWeight: ["r3"],
  });

  expect(preview.financeParts).toEqual([
    { categoryId: undefined, kind: "ADJUSTMENT", valueCents: -100 },
  ]);
  expect(preview.newItems[0].suggestion).toBeUndefined();
  expect(parseClosePreview({ financeParts: null })).toMatchObject({
    expirations: [],
    financeParts: undefined,
    missingPrices: [],
    needsDefaultFinanceCategory: false,
    newItems: [],
    unknownWeight: [],
  });

  expect(
    parseClosedPurchase({
      list: { removedRows: 1, updatedRows: 0 },
      purchase,
      splitId: "s1",
      stock: { lots: 2, newItems: 1 },
      transactionId: null,
    }),
  ).toMatchObject({
    splitId: "s1",
    stock: { lots: 2 },
    transactionId: undefined,
  });
});

it("SHOULD parse the price history page", () => {
  expect(
    parseItemPrices({
      items: [{ date: "d", id: "h", marketId: "m", unitPriceCents: 1 }],
      nextCursor: null,
    }),
  ).toEqual({
    items: [{ date: "d", id: "h", marketId: "m", unitPriceCents: 1 }],
    nextCursor: undefined,
  });
  expect(parseItemPrices({})).toEqual({ items: [], nextCursor: undefined });
});
