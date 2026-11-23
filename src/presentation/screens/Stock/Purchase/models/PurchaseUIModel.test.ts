import {
  PurchaseRowEntity,
  PurchaseRowStates,
  PurchaseStatuses,
  PurchaseViewEntity,
} from "@domain/entities/stock/PurchaseEntity";
import {
  ShoppingListDetailEntity,
  ShoppingListRowOrigins,
} from "@domain/entities/stock/ShoppingListEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";

import { buildPurchaseModel, priceChangeOf } from "./PurchaseUIModel";

function listRow(id: string) {
  return {
    description: `List ${id}`,
    id,
    origin: ShoppingListRowOrigins.MANUAL,
    priceSource: "NONE" as const,
    quantity: 2,
    unit: StockUnits.UNIT,
  };
}

function row(
  id: string,
  extra: Partial<PurchaseRowEntity> = {},
): PurchaseRowEntity {
  return {
    checkedAt: "2026-11-18T10:00:00.000Z",
    description: `Row ${id}`,
    id,
    state: PurchaseRowStates.IN_CART,
    unknownPrice: false,
    ...extra,
  };
}

function view(
  rows: PurchaseRowEntity[],
  otherCarts: PurchaseViewEntity["otherCarts"] = [],
): PurchaseViewEntity {
  return {
    cart: { count: rows.length, totalCents: 0, unpricedCount: 0 },
    forecastCents: 0,
    otherCarts,
    purchase: {
      currency: "BRL",
      id: "p",
      lastActivityAt: "2026-11-18T10:00:00.000Z",
      listId: "l",
      marketId: "m",
      purchaseDate: "2026-11-18",
      status: PurchaseStatuses.OPEN,
    },
    remaining: { count: 0, estimatedCents: 0, pricedCount: 0 },
    rows,
  };
}

const detail = {
  groups: [
    {
      category: { id: "c", name: "Dairy", path: "Dairy" },
      rows: [listRow("l1"), listRow("l2"), listRow("l3"), listRow("l4")],
      subtotalCents: 0,
      unpricedCount: 0,
    },
  ],
} as unknown as ShoppingListDetailEntity;

describe("priceChangeOf", () => {
  it("SHOULD notice only from ±5 percent", () => {
    expect(priceChangeOf()).toBe("NONE");
    expect(priceChangeOf(5)).toBe("UP");
    expect(priceChangeOf(4)).toBe("NONE");
    expect(priceChangeOf(-5)).toBe("CHEAPER");
    expect(priceChangeOf(-4)).toBe("NONE");
  });
});

describe("buildPurchaseModel", () => {
  it("SHOULD split the list into to-buy, other carts AND the cart of this purchase", () => {
    const model = buildPurchaseModel({
      detail,
      view: view(
        [
          row("r1", {
            lineTotalCents: 500,
            listRowId: "l1",
            priceChangePercent: 18,
            quantity: 1,
            unitPriceCents: 500,
          }),
          row("r2", { listRowId: "l2", state: PurchaseRowStates.NOT_FOUND }),
        ],
        [
          {
            listRowId: "l3",
            marketName: "Atacadão",
            purchaseId: "o",
            userName: "Ana",
          },
        ],
      ),
    });

    expect(model.cart.map((entry) => entry.id)).toEqual(["r1"]);
    expect(model.cart[0]).toMatchObject({
      outsideList: false,
      priceChange: "UP",
    });
    expect(model.toBuy.map((entry) => entry.id)).toEqual(["l3", "l4", "l2"]);
    expect(model.toBuy[0].otherCart).toEqual({
      marketName: "Atacadão",
      userName: "Ana",
    });
    expect(model.toBuy[2]).toMatchObject({
      notFound: true,
      purchaseRowId: "r2",
    });
  });

  it("SHOULD mark an outside-the-list row, the pending ones AND a row without weight or price", () => {
    const model = buildPurchaseModel({
      pending: new Set(["r1"]),
      view: view([
        row("r1"),
        row("r2", {
          lineTotalCents: 100,
          listRowId: "l1",
          quantity: 1,
          unitPriceCents: 100,
        }),
      ]),
    });

    expect(model.cart[0]).toMatchObject({
      outsideList: true,
      pending: true,
      unknownWeightOrPrice: true,
    });
    expect(model.cart[1].unknownWeightOrPrice).toBe(false);
  });

  it("SHOULD layer the queued writes over the server rows (a removal wins)", () => {
    const model = buildPurchaseModel({
      overlay: new Map([
        ["new", row("new", { description: "Candle" })],
        ["r1", undefined],
      ]),
      view: view([row("r1")]),
    });

    expect(model.cart.map((entry) => entry.id)).toEqual(["new"]);
  });
});
