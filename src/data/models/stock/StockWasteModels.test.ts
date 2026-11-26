import { parseConsumptionWeeks, parseWaste } from "./StockWasteModels";

it("SHOULD read the 12 weeks with their calendar day", () => {
  const [week] = parseConsumptionWeeks({
    weeks: [{ excluded: true, quantity: 2.5, start: "2026-09-07" }],
  });

  expect(week.excluded).toBe(true);
  expect(week.quantity).toBe(2.5);
  expect([
    week.start.getFullYear(),
    week.start.getMonth(),
    week.start.getDate(),
  ]).toEqual([2026, 8, 7]);
});

it("SHOULD read the waste report with per-currency totals AND the missing category", () => {
  const waste = parseWaste({
    byCategory: [
      {
        category: { id: "c", name: "Hortifrúti" },
        count: 4,
        totals: [{ currency: "BRL", valueCents: 2480 }],
      },
      { category: null, count: 1, totals: [] },
    ],
    byReason: [
      {
        count: 7,
        reason: "EXPIRED",
        totals: [{ currency: "BRL", valueCents: 4110 }],
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
  });

  expect(waste.firstMonth).toBe("2026-03");
  expect(waste.byCategory[0].category).toEqual({ id: "c", name: "Hortifrúti" });
  expect(waste.byCategory[1].category).toBeUndefined();
  expect(waste.summary).toEqual({
    discardCount: 11,
    itemCount: 9,
    unpricedCount: 1,
  });
  expect(waste.topItems[0]).toMatchObject({
    itemId: "i1",
    mainReason: "EXPIRED",
  });
  expect(waste.totals[0].valueCents).toBe(6340);
  expect(waste.moreItemsCount).toBe(4);
});

it("SHOULD survive an empty month", () => {
  const waste = parseWaste({ month: "2026-11" });

  expect(waste).toMatchObject({
    byCategory: [],
    byReason: [],
    moreItemsCount: 0,
    summary: { discardCount: 0 },
    topItems: [],
    totals: [],
  });
  expect(waste.firstMonth).toBeUndefined();
});
