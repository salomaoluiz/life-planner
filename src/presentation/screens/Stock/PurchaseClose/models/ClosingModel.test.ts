import {
  PurchaseRowEntity,
  PurchaseRowStates,
} from "@domain/entities/stock/PurchaseEntity";

import {
  breakdownOf,
  lineTotalOf,
  parseWeight,
  visibleSteps,
} from "./ClosingModel";

function row(
  id: string,
  extra: Partial<PurchaseRowEntity> = {},
): PurchaseRowEntity {
  return {
    checkedAt: "2026-11-18T10:00:00.000Z",
    description: id,
    id,
    state: PurchaseRowStates.IN_CART,
    unknownPrice: false,
    ...extra,
  };
}

describe("parseWeight / lineTotalOf", () => {
  it("SHOULD read comma and dot AND refuse zero or text", () => {
    expect(parseWeight("0,82")).toBe(0.82);
    expect(parseWeight("1.5")).toBe(1.5);
    expect(parseWeight("0")).toBeUndefined();
    expect(parseWeight("x")).toBeUndefined();
    expect(parseWeight()).toBeUndefined();
  });

  it("SHOULD multiply the typed unit price by the weight or the quantity", () => {
    expect(lineTotalOf(row("a"), { priceCents: 849, weight: "0,82" })).toBe(
      696,
    );
    expect(lineTotalOf(row("a", { quantity: 3 }), { priceCents: 250 })).toBe(
      750,
    );
    expect(lineTotalOf(row("a", { lineTotalCents: 400 }))).toBe(400);
    expect(
      lineTotalOf(row("a", { lineTotalCents: 400 }), { unknown: true }),
    ).toBeUndefined();
  });
});

describe("breakdownOf", () => {
  it("SHOULD report the signed adjustment WHEN every row is priced", () => {
    const result = breakdownOf({
      edits: {},
      receiptTotalCents: 900,
      rows: [row("a", { lineTotalCents: 1000 })],
    });

    expect(result).toMatchObject({ differenceCents: -100, mode: "ALL_PRICED" });
  });

  it("SHOULD give the difference to the single row without price AND refuse WHEN nothing is left", () => {
    const rows = [row("a", { lineTotalCents: 400 }), row("b")];

    expect(
      breakdownOf({ edits: {}, receiptTotalCents: 1000, rows }),
    ).toMatchObject({
      differenceCents: 600,
      mode: "SINGLE_FILLED",
    });
    expect(breakdownOf({ edits: {}, receiptTotalCents: 400, rows }).mode).toBe(
      "TOTAL_BELOW",
    );
  });

  it("SHOULD form the no-price part from the unknown rows AND flag unmarked rows", () => {
    const rows = [row("a", { lineTotalCents: 400 }), row("b"), row("c")];

    expect(
      breakdownOf({
        edits: { b: { unknown: true }, c: { unknown: true } },
        receiptTotalCents: 1000,
        rows,
      }),
    ).toMatchObject({
      differenceCents: 600,
      mode: "UNKNOWN_PART",
      noPriceCount: 2,
    });
    expect(
      breakdownOf({ edits: {}, receiptTotalCents: 1000, rows }),
    ).toMatchObject({
      mode: "UNPRICED",
      noPriceCount: 2,
    });
    expect(
      breakdownOf({
        edits: { b: { unknown: true }, c: { unknown: true } },
        receiptTotalCents: 300,
        rows,
      }).mode,
    ).toBe("TOTAL_BELOW");
  });
});

describe("visibleSteps", () => {
  it("SHOULD skip the steps without anything to ask", () => {
    expect(visibleSteps({ hasExpirations: false, hasNewItems: false })).toEqual(
      ["prices", "payment"],
    );
    expect(visibleSteps({ hasExpirations: true, hasNewItems: true })).toEqual([
      "prices",
      "newItems",
      "expirations",
      "payment",
    ]);
  });
});
