import {
  ShoppingListDetailEntity,
  ShoppingListRowEntity,
  ShoppingListRowOrigins,
  ShoppingListStatuses,
} from "@domain/entities/stock/ShoppingListEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";

import ShoppingListDetailUIModel from "./ShoppingListDetailUIModel";

function row(
  id: string,
  extra: Partial<ShoppingListRowEntity> = {},
): ShoppingListRowEntity {
  return {
    description: id,
    id,
    itemId: id,
    origin: ShoppingListRowOrigins.MANUAL,
    priceSource: "NONE",
    quantity: 1,
    unit: StockUnits.UNIT,
    ...extra,
  };
}

const detail: ShoppingListDetailEntity = {
  groups: [
    {
      category: { id: "c", name: "Dairy", path: "Dairy" },
      rows: [
        row("auto", {
          origin: ShoppingListRowOrigins.AUTO,
          stock: { idealQuantity: 8, minQuantity: 3, quantity: 2 },
        }),
        row("edited", { origin: ShoppingListRowOrigins.AUTO_EDITED }),
        row("manual"),
      ],
      subtotalCents: 100,
      unpricedCount: 1,
    },
    {
      rows: [row("text", { itemId: undefined })],
      subtotalCents: 0,
      unpricedCount: 1,
    },
  ],
  list: {
    currency: "BRL",
    id: "l",
    isDefault: true,
    name: "Mercado",
    owner: "USER",
    ownerId: "u",
    purchaseIntervalDays: 7,
    status: ShoppingListStatuses.ACTIVE,
  },
  totals: {
    autoCount: 2,
    estimatedTotalCents: 100,
    forecastCount: 0,
    pricedCount: 1,
    rowCount: 4,
  },
};
const model = new ShoppingListDetailUIModel(detail);

it("SHOULD name the groups and keep Outros (no category) unnamed for the view to translate", () => {
  expect(model.groups.map((group) => [group.id, group.name])).toEqual([
    ["c", "Dairy"],
    ["other", ""],
  ]);
  expect(model.rows).toHaveLength(4);
  expect(model.isEmpty).toBe(false);
});

it("SHOULD badge Automatic, Edited by you and Text only, and nothing for a manual item row", () => {
  const byId = Object.fromEntries(model.rows.map((r) => [r.id, r]));

  expect(byId.auto.badge?.labelKey).toBe("stock.lists.badge.auto");
  expect(byId.edited.badge?.labelKey).toBe("stock.lists.badge.edited");
  expect(byId.text.badge?.labelKey).toBe("stock.lists.badge.text");
  expect(byId.manual.badge).toBeUndefined();
});

it("SHOULD build the stock line parts and the note under the name", () => {
  const byId = Object.fromEntries(model.rows.map((r) => [r.id, r]));

  expect(byId.auto.stockParts.map((part) => part.key)).toEqual([
    "stock.lists.hasQuantity",
    "stock.lists.minQuantity",
    "stock.lists.idealQuantity",
  ]);
  expect(byId.auto.noteKey).toBeUndefined();
  expect(byId.edited.noteKey).toBe("stock.lists.wasAuto");
  expect(byId.manual.noteKey).toBe("stock.lists.manualRow");
  expect(byId.text.noteKey).toBe("stock.lists.textHint");
  expect(byId.text.isText).toBe(true);
});

it("SHOULD be empty without rows and skip min/ideal parts that are not set", () => {
  const empty = new ShoppingListDetailUIModel({
    ...detail,
    groups: [
      {
        rows: [
          row("x", {
            origin: ShoppingListRowOrigins.AUTO,
            stock: { quantity: 0 },
          }),
        ],
        subtotalCents: 0,
        unpricedCount: 1,
      },
    ],
    totals: {
      autoCount: 1,
      estimatedTotalCents: 0,
      forecastCount: 0,
      pricedCount: 0,
      rowCount: 0,
    },
  });

  expect(empty.isEmpty).toBe(true);
  expect(empty.rows[0].stockParts).toHaveLength(1);
});

describe("spec 123 forecast rows", () => {
  const nextTrip = new Date(2026, 10, 29);

  function build(extra: Partial<ShoppingListRowEntity>) {
    return new ShoppingListDetailUIModel({
      ...detail,
      groups: [
        {
          rows: [
            row("forecast", {
              forecast: {
                minDate: new Date(2026, 10, 28),
                nextTripDate: nextTrip,
                projectedOnTrip: 2.4,
              },
              origin: ShoppingListRowOrigins.FORECAST,
              stock: { idealQuantity: 8, minQuantity: 3, quantity: 6 },
              ...extra,
            }),
          ],
          subtotalCents: 0,
          unpricedCount: 0,
        },
      ],
    }).rows[0];
  }

  it("SHOULD badge a FORECAST row as Previsto AND carry its projection", () => {
    const view = build({});

    expect(view.badge).toEqual({
      labelKey: "stock.lists.badge.forecast",
      testID: "badgeForecast",
      tone: "warning",
    });
    expect(view.forecast).toEqual({
      date: nextTrip,
      have: 6,
      ideal: 8,
      min: 3,
      projected: 2.4,
    });
  });

  it("SHOULD show the waste hint from 30% AND round it to a whole percent", () => {
    expect(build({ wasteRatio90d: 0.3 }).wastePercent).toBe(30);
    expect(build({ wasteRatio90d: 0.354 }).wastePercent).toBe(35);
    expect(build({ wasteRatio90d: 0.29 }).wastePercent).toBeUndefined();
    expect(build({}).wastePercent).toBeUndefined();
  });

  it("SHOULD keep the quantity the API sent (the hint never changes it)", () => {
    expect(build({ quantity: 6, wasteRatio90d: 0.5 }).entity.quantity).toBe(6);
  });
});
