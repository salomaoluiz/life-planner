import TransactionDTO from "@application/dto/financial/TransactionDTO";

import {
  ALL_FILTER,
  applyFilter,
  buildEntries,
  formatDayTitle,
  formatMonthLabel,
  isInMonth,
  monthChoices,
  netAmount,
  ownerFilter,
  resolveDayLabel,
  shiftMonth,
  startOfMonth,
  stickyIndices,
} from "./transactionList";
import TransactionUIModel from "./TransactionUIModel";

function tx(
  id: string,
  date: Date,
  type = "EXPENSE",
  value = "10.00",
  ownerId = "user-id",
) {
  return new TransactionUIModel(
    new TransactionDTO({
      accountId: "a",
      category: "c",
      categoryId: "c",
      date: date.toISOString(),
      description: id,
      id,
      owner: "USER",
      ownerId,
      type,
      value,
    }),
  );
}

const now = new Date(2026, 9, 5, 15, 30);

describe("month helpers", () => {
  it("SHOULD get the first day of the month at midnight", () => {
    expect(startOfMonth(new Date(2026, 9, 17, 22, 5))).toEqual(
      new Date(2026, 9, 1),
    );
  });

  it("SHOULD shift months across year boundaries and allow future months", () => {
    expect(shiftMonth(new Date(2026, 0, 1), -1)).toEqual(new Date(2025, 11, 1));
    expect(shiftMonth(new Date(2026, 11, 1), 1)).toEqual(new Date(2027, 0, 1));
    expect(shiftMonth(new Date(2026, 9, 1), 3)).toEqual(new Date(2027, 0, 1));
  });

  it("SHOULD include the first and last day of the month and exclude neighbours", () => {
    const october = new Date(2026, 9, 1);

    expect(isInMonth(new Date(2026, 9, 1, 0, 0, 0), october)).toBe(true);
    expect(isInMonth(new Date(2026, 9, 31, 23, 59, 59), october)).toBe(true);
    expect(isInMonth(new Date(2026, 8, 30, 23, 59, 59), october)).toBe(false);
    expect(isInMonth(new Date(2026, 10, 1), october)).toBe(false);
  });

  it("SHOULD handle February of a leap year", () => {
    expect(isInMonth(new Date(2028, 1, 29), new Date(2028, 1, 1))).toBe(true);
    expect(isInMonth(new Date(2028, 2, 1), new Date(2028, 1, 1))).toBe(false);
  });
});

describe("filters", () => {
  const items = [
    tx("e1", new Date(2026, 9, 1)),
    tx("i1", new Date(2026, 9, 2), "INCOME"),
    tx("f1", new Date(2026, 9, 3), "EXPENSE", "5.00", "family-1"),
  ];

  it("SHOULD return everything for ALL", () => {
    expect(applyFilter(items, ALL_FILTER)).toHaveLength(3);
  });

  it("SHOULD filter by type", () => {
    expect(applyFilter(items, "EXPENSE").map((i) => i.id)).toEqual([
      "e1",
      "f1",
    ]);
    expect(applyFilter(items, "INCOME").map((i) => i.id)).toEqual(["i1"]);
  });

  it("SHOULD filter by owner", () => {
    expect(
      applyFilter(items, ownerFilter("family-1")).map((i) => i.id),
    ).toEqual(["f1"]);
  });

  it("SHOULD return nothing for an owner without transactions", () => {
    expect(applyFilter(items, ownerFilter("nobody"))).toEqual([]);
  });
});

describe("day labels and entries", () => {
  it("SHOULD label today, yesterday and other days", () => {
    expect(resolveDayLabel(new Date(2026, 9, 5), now)).toEqual({
      kind: "today",
    });
    expect(resolveDayLabel(new Date(2026, 9, 4), now)).toEqual({
      kind: "yesterday",
    });
    expect(resolveDayLabel(new Date(2026, 8, 30), now)).toEqual({
      date: new Date(2026, 8, 30),
      kind: "date",
    });
  });

  it("SHOULD label yesterday across a month boundary", () => {
    expect(
      resolveDayLabel(new Date(2026, 8, 30), new Date(2026, 9, 1)),
    ).toEqual({ kind: "yesterday" });
  });

  it("SHOULD group by day, newest first, with the day's net total", () => {
    const entries = buildEntries(
      [
        tx("a", new Date(2026, 9, 3, 9), "EXPENSE", "10.00"),
        tx("b", new Date(2026, 9, 5), "INCOME", "100.00"),
        tx("c", new Date(2026, 9, 3, 18), "EXPENSE", "2.50"),
      ],
      now,
    );

    expect(entries.map((entry) => entry.kind)).toEqual([
      "header",
      "item",
      "header",
      "item",
      "item",
    ]);
    const headers = entries.filter((entry) => entry.kind === "header");
    expect(headers.map((h) => h.kind === "header" && h.netCents)).toEqual([
      10000, -1250,
    ]);
    expect(stickyIndices(entries)).toEqual([0, 2]);
  });

  it("SHOULD return no entries for no items", () => {
    expect(buildEntries([], now)).toEqual([]);
    expect(stickyIndices([])).toEqual([]);
  });

  it("SHOULD use unique keys", () => {
    const entries = buildEntries(
      [tx("a", new Date(2026, 9, 3)), tx("b", new Date(2026, 9, 3))],
      now,
    );

    expect(new Set(entries.map((e) => e.key)).size).toBe(entries.length);
  });
});

describe("netAmount", () => {
  it("SHOULD give the absolute value and the type from the sign", () => {
    expect(netAmount(-1250)).toEqual({ type: "EXPENSE", value: 1250 });
    expect(netAmount(10000)).toEqual({ type: "INCOME", value: 10000 });
    expect(netAmount(0)).toEqual({ value: 0 });
  });
});

describe("formatting", () => {
  it("SHOULD format the month label", () => {
    expect(formatMonthLabel(new Date(2026, 9, 1), "en-US")).toBe(
      "October 2026",
    );
  });

  it("SHOULD format the day title as weekday, day and month", () => {
    expect(formatDayTitle(new Date(2026, 8, 30), "en-US")).toBe("Wed, 30 Sep");
  });

  it("SHOULD list 12 month choices", () => {
    const choices = monthChoices("en-US");

    expect(choices).toHaveLength(12);
    expect(choices[0]).toEqual({ label: "January", value: "0" });
    expect(choices[11]).toEqual({ label: "December", value: "11" });
  });
});
