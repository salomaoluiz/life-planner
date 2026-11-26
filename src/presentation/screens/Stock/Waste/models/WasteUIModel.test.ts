import { WasteEntity } from "@domain/entities/stock/StockWasteEntity";

import WasteUIModel, { currentMonthKey, shiftMonth } from "./WasteUIModel";

const base: WasteEntity = {
  byCategory: [
    {
      category: { id: "c", name: "Hortifrúti" },
      count: 4,
      totals: [{ currency: "BRL", valueCents: 2480 }],
    },
    {
      category: undefined,
      count: 1,
      totals: [{ currency: "BRL", valueCents: 620 }],
    },
  ],
  byReason: [
    {
      count: 7,
      reason: "EXPIRED",
      totals: [{ currency: "BRL", valueCents: 4110 }],
    },
    {
      count: 3,
      reason: "SPOILED",
      totals: [{ currency: "BRL", valueCents: 1830 }],
    },
  ],
  firstMonth: "2026-03",
  month: "2026-11",
  moreItemsCount: 4,
  previousMonth: [{ currency: "BRL", discardCount: 8, valueCents: 5130 }],
  summary: { discardCount: 11, itemCount: 9, unpricedCount: 1 },
  topItems: [
    {
      count: 2,
      description: "Iogurte natural",
      itemId: "i1",
      mainReason: "EXPIRED",
      quantity: 4,
      totals: [{ currency: "BRL", valueCents: 1280 }],
      unit: "unit",
    },
  ],
  totals: [
    {
      currency: "BRL",
      discardCount: 11,
      itemCount: 9,
      unpricedCount: 1,
      valueCents: 6340,
    },
  ],
};

function model(extra: Partial<WasteEntity> = {}, current = "2026-11") {
  return new WasteUIModel({ ...base, ...extra }, "en-US", current);
}

describe("navigation", () => {
  it("SHOULD stop at the current month AND at the first month with a discard", () => {
    expect(model().canGoNext).toBe(false);
    expect(model({ month: "2026-10" }).canGoNext).toBe(true);
    expect(model({ month: "2026-03" }).canGoPrevious).toBe(false);
    expect(model({ month: "2026-04" }).canGoPrevious).toBe(true);
    expect(model({ firstMonth: undefined }).canGoPrevious).toBe(false);
  });

  it("SHOULD shift the month across the year", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(currentMonthKey(new Date(2026, 10, 25))).toBe("2026-11");
  });
});

describe("tiles", () => {
  it("SHOULD show the value per currency, the counts AND the change against the previous month", () => {
    const ui = model();

    expect(ui.totalValues[0]).toContain("63.40");
    expect(ui.discardCount).toBe(11);
    expect(ui.distinctItems).toBe(9);
    expect(ui.unpricedCount).toBe(1);
    expect(ui.delta).toMatchObject({
      key: "stock.waste.deltaUp",
      params: { value: expect.stringContaining("12.10") },
      tone: "bad",
    });
  });

  it("SHOULD say it fell, or stayed, or show no change without a previous month", () => {
    expect(
      model({
        previousMonth: [{ currency: "BRL", discardCount: 1, valueCents: 9000 }],
      }).delta,
    ).toMatchObject({
      key: "stock.waste.deltaDown",
      tone: "good",
    });
    expect(
      model({
        previousMonth: [{ currency: "BRL", discardCount: 1, valueCents: 6340 }],
      }).delta?.key,
    ).toBe("stock.waste.deltaSame");
    expect(model({ previousMonth: [] }).delta).toBeUndefined();
  });

  it("SHOULD never sum two currencies", () => {
    const ui = model({
      totals: [
        {
          currency: "BRL",
          discardCount: 2,
          itemCount: 2,
          unpricedCount: 0,
          valueCents: 1000,
        },
        {
          currency: "EUR",
          discardCount: 1,
          itemCount: 1,
          unpricedCount: 0,
          valueCents: 500,
        },
      ],
    });

    expect(ui.totalValues).toHaveLength(2);
    expect(ui.totalValues[0]).not.toBe(ui.totalValues[1]);
  });
});

describe("bars", () => {
  it("SHOULD give the share and the bar length of each reason", () => {
    const [first, second] = model().byReason;

    expect(first).toMatchObject({ id: "EXPIRED", percent: "69%", ratio: 1 });
    expect(second.percent).toBe("31%");
    expect(second.ratio).toBeCloseTo(1830 / 4110);
  });

  it("SHOULD keep the category without a name for the view to translate", () => {
    expect(model().byCategory.map((row) => row.id)).toEqual(["c", "none"]);
    expect(model().byCategory[1].label).toBe("");
  });

  it("SHOULD follow the count WHEN there are two currencies", () => {
    const ui = model({
      byReason: [
        {
          count: 3,
          reason: "EXPIRED",
          totals: [{ currency: "BRL", valueCents: 100 }],
        },
        {
          count: 1,
          reason: "SPOILED",
          totals: [{ currency: "EUR", valueCents: 900 }],
        },
      ],
    });

    expect(ui.byReason.map((row) => row.percent)).toEqual(["75%", "25%"]);
  });
});

describe("items and empty month", () => {
  it("SHOULD describe each top item with its quantity, count, reason and value", () => {
    const [item] = model().topItems;

    expect(item).toMatchObject({
      detail: {
        count: 2,
        quantity: { text: "4", unitKey: "common.units.unit" },
      },
      id: "i1",
      name: "Iogurte natural",
      reasonKey: "stock.waste.reason.expired",
    });
    expect(item.value).toContain("12.80");
    expect(model().moreItemsCount).toBe(4);
  });

  it("SHOULD be empty WHEN nothing was discarded", () => {
    expect(
      model({
        byCategory: [],
        byReason: [],
        summary: { discardCount: 0, itemCount: 0, unpricedCount: 0 },
        topItems: [],
        totals: [],
      }).isEmpty,
    ).toBe(true);
    expect(model().isEmpty).toBe(false);
  });
});
