import {
  parseRestockSummary,
  parseShoppingList,
  parseShoppingListCard,
  parseShoppingListDetail,
  parseShoppingListRow,
  parseShoppingListRowResult,
} from "./ShoppingListModels";

const list = {
  currency: "BRL",
  id: "l",
  isDefault: true,
  name: "Mercado",
  owner: "FAMILY",
  ownerId: "f",
  status: "ACTIVE",
};
const itemRow = {
  description: "Milk",
  estimateCents: 2934,
  id: "r",
  itemId: "i",
  origin: "AUTO",
  priceSource: "MANUAL",
  quantity: 6,
  stock: {
    categoryPath: "Dairy",
    idealQuantity: 8,
    minQuantity: 3,
    quantity: 2,
  },
  unit: "unit",
  unitPriceCents: 489,
};
const textRow = {
  description: "Candle",
  estimateCents: null,
  id: "t",
  itemId: null,
  origin: "MANUAL",
  priceSource: "NONE",
  quantity: 1,
  stock: null,
  unit: "unit",
  unitPriceCents: null,
};

it("SHOULD parse a list and a card (missing counters read as 0)", () => {
  expect(parseShoppingList(list)).toEqual({ ...list, purchaseIntervalDays: 7 });
  expect(parseShoppingListCard(list)).toEqual({
    ...list,
    autoCount: 0,
    estimatedTotalCents: 0,
    forecastCount: 0,
    pricedCount: 0,
    purchaseIntervalDays: 7,
    rowCount: 0,
  });
  expect(
    parseShoppingListCard({ ...list, autoCount: 2, rowCount: 3 }),
  ).toMatchObject({ autoCount: 2, rowCount: 3 });
  expect(parseShoppingList({ ...list, isDefault: undefined }).isDefault).toBe(
    false,
  );
});

it("SHOULD parse an item row with its stock line and a text row with nulls", () => {
  expect(parseShoppingListRow(itemRow)).toMatchObject({
    estimateCents: 2934,
    itemId: "i",
    stock: {
      categoryPath: "Dairy",
      idealQuantity: 8,
      minQuantity: 3,
      quantity: 2,
    },
    unitPriceCents: 489,
  });
  expect(parseShoppingListRow(textRow)).toMatchObject({
    estimateCents: undefined,
    itemId: undefined,
    stock: undefined,
    unitPriceCents: undefined,
  });
});

it("SHOULD parse the detail with its groups, the category-less one and the totals", () => {
  const detail = parseShoppingListDetail({
    groups: [
      {
        category: { id: "c", name: "Dairy", path: "Dairy" },
        rows: [itemRow],
        subtotalCents: 2934,
        unpricedCount: 0,
      },
      { category: null, rows: [textRow] },
    ],
    list,
    totals: { estimatedTotalCents: 2934 },
  });

  expect(detail.groups[0].category).toEqual({
    id: "c",
    name: "Dairy",
    path: "Dairy",
  });
  expect(detail.groups[1]).toMatchObject({
    category: undefined,
    subtotalCents: 0,
    unpricedCount: 0,
  });
  expect(detail.totals).toEqual({
    autoCount: 0,
    estimatedTotalCents: 2934,
    forecastCount: 0,
    pricedCount: 0,
    rowCount: 0,
  });
  expect(
    parseShoppingListRowResult({ merged: true, row: itemRow }),
  ).toMatchObject({ merged: true, row: { id: "r" } });
  expect(parseShoppingListRowResult({ row: itemRow }).merged).toBe(false);
});

it("SHOULD parse the restock summary (and an empty one)", () => {
  const summary = parseRestockSummary({
    count: 7,
    groups: [
      {
        list: { id: "l", name: "Mercado", owner: "FAMILY", ownerName: "Casa" },
        rows: [{ description: "Milk", quantity: 6, unit: "unit" }],
      },
    ],
    totals: [{ currency: "BRL", estimatedTotalCents: 100, pricedCount: 1 }],
  });

  expect(summary.groups[0].list.ownerName).toBe("Casa");
  expect(summary.totals[0].currency).toBe("BRL");
  expect(parseRestockSummary({})).toEqual({ count: 0, groups: [], totals: [] });
});

describe("spec 123", () => {
  it("SHOULD read the interval, the next trip AND the suggestion of a list", () => {
    const parsed = parseShoppingList({
      ...list,
      nextTripDate: "2026-11-29",
      purchaseIntervalDays: 7,
      suggestedIntervalDays: 9,
    });

    expect(parsed.purchaseIntervalDays).toBe(7);
    expect(parsed.suggestedIntervalDays).toBe(9);
    expect(parsed.nextTripDate?.getDate()).toBe(29);
  });

  it("SHOULD default the interval to 7 AND leave the suggestion empty", () => {
    expect(parseShoppingList(list)).toMatchObject({ purchaseIntervalDays: 7 });
    expect(parseShoppingList(list).suggestedIntervalDays).toBeUndefined();
  });

  it("SHOULD read a FORECAST row with its projection AND the waste hint", () => {
    const row = parseShoppingListRow({
      ...itemRow,
      forecast: {
        minDate: "2026-11-28",
        nextTripDate: "2026-11-29",
        projectedOnTrip: 2.4,
      },
      origin: "FORECAST",
      wasteRatio90d: 0.35,
    });

    expect(row.origin).toBe("FORECAST");
    expect(row.forecast?.projectedOnTrip).toBe(2.4);
    expect(row.wasteRatio90d).toBe(0.35);
  });

  it("SHOULD show an origin it does not know as automatic", () => {
    expect(
      parseShoppingListRow({ ...itemRow, origin: "SOMETHING_NEW" }).origin,
    ).toBe("AUTO");
  });

  it("SHOULD read the forecast count of a card", () => {
    expect(
      parseShoppingListCard({ ...list, forecastCount: 2 }).forecastCount,
    ).toBe(2);
  });
});
