import { EMPTY_FILTERS } from "@screens/Financial/Transactions/models/transactionFilters";

import foldBars, { OTHER_ID } from "./barRows";
import toDrillThroughFilters from "./drillThrough";
import {
  averagePerMonth,
  compactAmount,
  defaultCurrency,
  deltaOf,
  formatTick,
  keepOrDefault,
  percentOf,
  tileColumns,
} from "./overviewFormat";
import {
  defaultGranularity,
  granularityOptions,
  monthsInPeriod,
  periodForPreset,
  validateCustomPeriod,
} from "./overviewPeriod";

describe("periodForPreset", () => {
  it("SHOULD end on the last day of the current month", () => {
    expect(periodForPreset("12M", "2026-10-20")).toEqual({
      from: "2025-11-01",
      to: "2026-10-31",
    });
    expect(periodForPreset("3M", "2026-10-20")).toEqual({
      from: "2026-08-01",
      to: "2026-10-31",
    });
    expect(periodForPreset("6M", "2026-10-20").from).toBe("2026-05-01");
    expect(periodForPreset("YEAR", "2026-10-20")).toEqual({
      from: "2026-01-01",
      to: "2026-10-31",
    });
  });
});

describe("granularity", () => {
  it("SHOULD default to day, week and month by the length", () => {
    expect(defaultGranularity("2026-10-01", "2026-10-31")).toBe("DAY");
    expect(defaultGranularity("2026-08-01", "2026-10-31")).toBe("WEEK");
    expect(defaultGranularity("2025-11-01", "2026-10-31")).toBe("MONTH");
  });

  it("SHOULD disable day above 92 days and week above a year, with a hint", () => {
    const year = granularityOptions("2025-11-01", "2026-10-31");

    expect(year.map((option) => option.enabled)).toEqual([false, true, true]);
    expect(year[0].hintKey).toBe("day");
    expect(
      granularityOptions("2024-11-01", "2026-10-31").map((o) => o.hintKey),
    ).toEqual(["day", "week", undefined]);
    expect(
      granularityOptions("2026-08-01", "2026-10-31").every((o) => o.enabled),
    ).toBe(true);
  });
});

describe("validateCustomPeriod", () => {
  it("SHOULD accept a range inside 2 years that ends by the end of the month", () => {
    expect(
      validateCustomPeriod("2025-01-01", "2026-10-31", "2026-10-20"),
    ).toEqual({
      ok: true,
    });
  });

  it("SHOULD refuse a `to` after the end of the current month or over 2 years", () => {
    expect(
      validateCustomPeriod("2026-01-01", "2026-11-01", "2026-10-20"),
    ).toEqual({
      maxTo: "2026-10-31",
      ok: false,
    });
    expect(
      validateCustomPeriod("2024-01-01", "2026-01-01", "2026-10-20"),
    ).toMatchObject({
      maxTo: "2025-12-31",
      ok: false,
    });
  });
});

describe("currency", () => {
  const options = [
    { accounts: 1, cards: 0, code: "USD" },
    { accounts: 3, cards: 2, code: "BRL" },
  ];

  it("SHOULD default to the currency with most accounts, ties by the supported order", () => {
    expect(defaultCurrency(options)).toBe("BRL");
    expect(
      defaultCurrency([
        { accounts: 1, cards: 0, code: "EUR" },
        { accounts: 1, cards: 0, code: "USD" },
      ]),
    ).toBe("USD");
    expect(defaultCurrency([])).toBe("BRL");
  });

  it("SHOULD keep the current currency while it exists, else the default", () => {
    expect(keepOrDefault("USD", options)).toBe("USD");
    expect(keepOrDefault("EUR", options)).toBe("BRL");
  });
});

describe("deltaOf", () => {
  it("SHOULD show the change and the tone by direction", () => {
    expect(deltaOf(1084, 1000, "upIsGood", "en-US")).toEqual({
      text: "▲ 8.4%",
      tone: "good",
    });
    expect(deltaOf(1084, 1000, "upIsBad", "en-US").tone).toBe("bad");
    expect(deltaOf(800, 1000, "upIsBad", "pt-BR")).toEqual({
      text: "▼ 20,0%",
      tone: "good",
    });
  });

  it("SHOULD show a dash without previous data, never Infinity or NaN", () => {
    expect(deltaOf(10, 0, "upIsGood", "en-US")).toEqual({
      text: "—",
      tone: "neutral",
    });
    expect(deltaOf(10, undefined, "upIsGood", "en-US").text).toBe("—");
    expect(deltaOf(10, 10, "upIsGood", "en-US").tone).toBe("neutral");
  });
});

describe("formatting", () => {
  it("SHOULD shorten axis labels by locale and width", () => {
    expect(formatTick(1200000, "pt-BR", "BRL", false)).toBe("R$ 12 mil");
    expect(formatTick(1200000, "pt-BR", "BRL", true)).toBe("12k");
    expect(formatTick(50000, "en-US", "USD", false)).toBe("$ 500");
  });

  it("SHOULD give 0% for an empty total", () => {
    expect(percentOf(50, 200, "en-US")).toBe("25%");
    expect(percentOf(0, 0, "en-US")).toBe("0%");
  });
});

describe("foldBars", () => {
  const items = Array.from({ length: 9 }, (_, index) => ({
    id: `c${index}`,
    name: `Cat ${index}`,
    value: 900 - index * 100,
  }));
  const base = {
    format: (value: number) => `${value}`,
    localeTag: "en-US",
    otherLabel: "Other",
    top: 8,
    total: 4500,
  };

  it("SHOULD keep the top 8 and fold the rest in a muted Other row", () => {
    const rows = foldBars({ ...base, items });

    expect(rows).toHaveLength(9);
    expect(rows[8]).toMatchObject({ id: OTHER_ID, muted: true, value: "100" });
    expect(rows[0].ratio).toBe(1);
  });

  it("SHOULD mark archived categories AND append muted extra rows", () => {
    const rows = foldBars({
      ...base,
      archivedSuffix: "Archived",
      extra: [{ id: "untagged", name: "No tag", value: 300 }],
      items: [{ archived: true, id: "a", name: "Old", value: 500 }],
    });

    expect(rows[0].suffix).toBe("Archived");
    expect(rows[1]).toMatchObject({ id: "untagged", muted: true });
  });

  it("SHOULD add the average to every row, Other included, AND none WHEN the callback returns undefined", () => {
    const rows = foldBars({
      ...base,
      averageOf: (value) => `avg ${value / 3}`,
      extra: [{ id: "untagged", name: "No tag", value: 300 }],
      items,
    });

    expect(rows[0].average).toBe("avg 300");
    expect(rows[8]).toMatchObject({ average: "avg 33.333333333333336" });
    expect(rows[9].average).toBe("avg 100");
    expect(
      foldBars({ ...base, averageOf: () => undefined, items })[0].average,
    ).toBeUndefined();
  });

  it("SHOULD drop zero items", () => {
    expect(
      foldBars({ ...base, items: [{ id: "z", name: "Zero", value: 0 }] }),
    ).toEqual([]);
  });
});

describe("toDrillThroughFilters", () => {
  it("SHOULD carry the period and filters and add the category", () => {
    const result = toDrillThroughFilters(
      {
        ...EMPTY_FILTERS,
        accountIds: ["a1"],
        categoryIds: ["c0"],
        search: "x",
      },
      { from: "2025-11-01", to: "2026-10-31" },
      { categoryId: "c1" },
    );

    expect(result).toMatchObject({
      accountIds: ["a1"],
      categoryIds: expect.arrayContaining(["c0", "c1"]),
      period: { from: "2025-11-01", to: "2026-10-31" },
      search: "x",
    });
  });

  it("SHOULD add a tag without duplicating it", () => {
    const result = toDrillThroughFilters(
      { ...EMPTY_FILTERS, tagIds: ["t1"] },
      { from: "2026-01-01", to: "2026-01-31" },
      { tagId: "t1" },
    );

    expect(result.tagIds).toEqual(["t1"]);
  });
});

describe("monthsInPeriod", () => {
  it("SHOULD count the calendar months the period touches", () => {
    expect(monthsInPeriod(periodForPreset("12M", "2026-10-20"))).toBe(12);
    expect(monthsInPeriod(periodForPreset("3M", "2026-10-20"))).toBe(3);
    expect(monthsInPeriod({ from: "2026-01-15", to: "2026-03-10" })).toBe(3);
    expect(monthsInPeriod({ from: "2025-12-20", to: "2026-01-05" })).toBe(2);
    expect(monthsInPeriod({ from: "2026-10-01", to: "2026-10-31" })).toBe(1);
  });
});

describe("averagePerMonth", () => {
  it("SHOULD be undefined for one month AND round the cents otherwise", () => {
    expect(averagePerMonth(1000, 1)).toBeUndefined();
    expect(averagePerMonth(1000, 3)).toBe(333);
    expect(averagePerMonth(85121_50, 12)).toBe(709346);
  });
});

describe("tileColumns", () => {
  it("SHOULD give 4 columns only WHEN each tile gets 220 px, otherwise 2 (never 3 + 1)", () => {
    expect(tileColumns(1000, 12)).toBe(4);
    expect(tileColumns(4 * 220 + 3 * 12, 12)).toBe(4);
    expect(tileColumns(4 * 220 + 3 * 12 - 1, 12)).toBe(2);
    expect(tileColumns(700, 12)).toBe(2);
    expect(tileColumns(260, 12)).toBe(2);
  });
});

describe("compactAmount", () => {
  it("SHOULD use the compact notation of the locale", () => {
    expect(compactAmount(31248055, "pt-BR", "BRL")).toMatch(/mil/);
    expect(compactAmount(31248055, "en-US", "BRL")).toMatch(/K/);
    expect(compactAmount(123456789, "pt-BR", "BRL")).toMatch(/mi/);
  });
});
