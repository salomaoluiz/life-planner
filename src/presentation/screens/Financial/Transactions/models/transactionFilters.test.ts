import TransactionDTO from "@application/dto/financial/TransactionDTO";

import {
  activeGroups,
  clearGroup,
  effectiveRange,
  EMPTY_FILTERS,
  isFiltering,
  matchesPendingFilters,
  periodPreset,
  summarize,
  toQueryFilter,
  validatePeriod,
  wantsAccountRows,
  wantsCards,
} from "./transactionFilters";

describe("activeGroups / isFiltering", () => {
  it("SHOULD count groups but not the search", () => {
    const filters = {
      ...EMPTY_FILTERS,
      categoryIds: ["c1"],
      origin: "CARD" as const,
      period: { from: "2025-01-01", to: "2025-02-28" },
      search: "mercado",
      situation: "UNPAID" as const,
    };

    expect(activeGroups(filters)).toEqual([
      "period",
      "origin",
      "categories",
      "situation",
    ]);
    expect(isFiltering(filters)).toBe(true);
  });

  it("SHOULD be filtering with a search only, and not with nothing or blanks", () => {
    expect(isFiltering({ ...EMPTY_FILTERS, search: "a" })).toBe(true);
    expect(isFiltering({ ...EMPTY_FILTERS, search: "   " })).toBe(false);
    expect(isFiltering(EMPTY_FILTERS)).toBe(false);
  });

  it("SHOULD clear accounts and cards together as one group", () => {
    const filters = { ...EMPTY_FILTERS, accountIds: ["a"], cardIds: ["k"] };

    expect(activeGroups(filters)).toEqual(["sources"]);
    expect(clearGroup(filters, "sources")).toEqual(EMPTY_FILTERS);
  });
});

describe("validatePeriod", () => {
  it("SHOULD accept exactly two years", () => {
    expect(validatePeriod("2024-01-01", "2025-12-31")).toEqual({ ok: true });
  });

  it("SHOULD refuse more than two years and tell the last valid day", () => {
    expect(validatePeriod("2024-01-01", "2026-03-15")).toEqual({
      maxTo: "2025-12-31",
      ok: false,
    });
  });

  it("SHOULD refuse an end before the start", () => {
    expect(validatePeriod("2025-02-01", "2025-01-01").ok).toBe(false);
  });
});

describe("periodPreset", () => {
  const today = new Date(2026, 4, 20);

  it("SHOULD build this month, the last 3 months and this year", () => {
    expect(periodPreset("THIS_MONTH", today)).toEqual({
      from: "2026-05-01",
      to: "2026-05-31",
    });
    expect(periodPreset("LAST_3_MONTHS", today)).toEqual({
      from: "2026-03-01",
      to: "2026-05-31",
    });
    expect(periodPreset("THIS_YEAR", today)).toEqual({
      from: "2026-01-01",
      to: "2026-12-31",
    });
  });
});

describe("effectiveRange", () => {
  it("SHOULD use the period, else the month on screen", () => {
    const month = new Date(2026, 1, 1);

    expect(effectiveRange(EMPTY_FILTERS, month)).toEqual({
      from: "2026-02-01",
      to: "2026-02-28",
    });
    expect(
      effectiveRange(
        { ...EMPTY_FILTERS, period: { from: "2025-01-01", to: "2025-06-30" } },
        month,
      ),
    ).toEqual({ from: "2025-01-01", to: "2025-06-30" });
  });
});

describe("wantsAccountRows / wantsCards", () => {
  it("SHOULD want both with no origin or choice", () => {
    expect(wantsAccountRows(EMPTY_FILTERS)).toBe(true);
    expect(wantsCards(EMPTY_FILTERS)).toBe(true);
  });

  it("SHOULD follow the origin", () => {
    expect(wantsCards({ ...EMPTY_FILTERS, origin: "ACCOUNT" })).toBe(false);
    expect(wantsAccountRows({ ...EMPTY_FILTERS, origin: "CARD" })).toBe(false);
  });

  it("SHOULD hide invoices when only accounts are chosen, and rows when only cards are", () => {
    expect(wantsCards({ ...EMPTY_FILTERS, accountIds: ["a"] })).toBe(false);
    expect(wantsAccountRows({ ...EMPTY_FILTERS, cardIds: ["k"] })).toBe(false);
    expect(
      wantsCards({ ...EMPTY_FILTERS, accountIds: ["a"], cardIds: ["k"] }),
    ).toBe(true);
  });
});

describe("toQueryFilter", () => {
  it("SHOULD map the screen filters to the API filter", () => {
    expect(
      toQueryFilter({
        ...EMPTY_FILTERS,
        accountIds: ["a"],
        cardIds: ["k"],
        period: { from: "2025-01-01", to: "2025-02-28" },
        search: " mercado ",
        situation: "UNPAID",
        tagIds: ["t"],
      }),
    ).toEqual({
      accountIds: ["a"],
      categoryIds: [],
      creditCardIds: ["k"],
      from: "2025-01-01",
      paid: false,
      q: "mercado",
      tagIds: ["t"],
      to: "2025-02-28",
    });
  });
});

describe("summarize", () => {
  function item(cents: number, expense: boolean, adjustment = false) {
    return {
      amountCents: cents,
      isAdjustment: adjustment,
      isExpense: expense,
    } as never;
  }
  function invoice(cents: number, matched: number, projected = 0) {
    return {
      amountCents: cents,
      matchedCount: matched,
      projectedItems: new Array(projected).fill(null),
    } as never;
  }

  it("SHOULD total account rows and filtered invoices, counting card purchases one by one", () => {
    expect(
      summarize(
        [item(1000, false), item(300, true), item(999, true, true)],
        [invoice(41230, 3, 1)],
      ),
    ).toEqual({
      count: 6,
      expenseCents: 41530,
      incomeCents: 1000,
      resultCents: -40530,
    });
  });
});

describe("matchesPendingFilters (spec 061)", () => {
  const row = new TransactionDTO({
    accountId: "acc-1",
    category: "Food",
    categoryId: "cat-1",
    date: new Date(2026, 9, 10).toISOString(),
    description: "Lunch at Café",
    id: "p-1",
    notes: "with team",
    owner: "USER",
    ownerId: "user-id",
    tags: [{ id: "tag-1", name: "work" }],
    type: "EXPENSE",
    value: "10.00",
  });

  it("SHOULD accept a row when no group excludes it", () => {
    expect(matchesPendingFilters(row, EMPTY_FILTERS)).toBe(true);
  });

  it("SHOULD reject a row outside the period, category, source, tags or situation", () => {
    expect(
      matchesPendingFilters(row, {
        ...EMPTY_FILTERS,
        period: { from: "2026-11-01", to: "2026-11-30" },
      }),
    ).toBe(false);
    expect(
      matchesPendingFilters(row, { ...EMPTY_FILTERS, categoryIds: ["x"] }),
    ).toBe(false);
    expect(
      matchesPendingFilters(row, { ...EMPTY_FILTERS, accountIds: ["x"] }),
    ).toBe(false);
    expect(
      matchesPendingFilters(row, { ...EMPTY_FILTERS, tagIds: ["x"] }),
    ).toBe(false);
    expect(
      matchesPendingFilters(row, { ...EMPTY_FILTERS, situation: "UNPAID" }),
    ).toBe(false);
    expect(
      matchesPendingFilters(row, { ...EMPTY_FILTERS, origin: "CARD" }),
    ).toBe(false);
  });

  it("SHOULD accept a row that matches the chosen groups", () => {
    expect(
      matchesPendingFilters(row, {
        ...EMPTY_FILTERS,
        accountIds: ["acc-1"],
        categoryIds: ["cat-1"],
        tagIds: ["tag-1"],
      }),
    ).toBe(true);
  });

  it("SHOULD search description, notes and category without case or accents", () => {
    expect(
      matchesPendingFilters(row, { ...EMPTY_FILTERS, search: "cafe" }),
    ).toBe(true);
    expect(
      matchesPendingFilters(row, { ...EMPTY_FILTERS, search: "TEAM" }),
    ).toBe(true);
    expect(
      matchesPendingFilters(row, { ...EMPTY_FILTERS, search: "zzz" }),
    ).toBe(false);
  });
});
