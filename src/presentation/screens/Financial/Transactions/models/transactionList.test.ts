import TransactionDTO from "@application/dto/financial/TransactionDTO";

import { makeInvoice } from "../mocks/invoice.mocks";
import {
  ALL_FILTER,
  buildEntries,
  filterByOwner,
  filterByType,
  filterInvoicesByOwner,
  filterInvoicesByType,
  formatDayTitle,
  formatMonthLabel,
  formatMonthName,
  isInMonth,
  mergeProjectedInvoices,
  monthChoices,
  netAmount,
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
    tx("fi", new Date(2026, 9, 4), "INCOME", "7.00", "family-1"),
  ];

  it("SHOULD return everything for owner ALL and type ALL", () => {
    expect(filterByOwner(items, ALL_FILTER)).toHaveLength(4);
    expect(filterByType(items, "ALL")).toHaveLength(4);
  });

  it("SHOULD filter by type", () => {
    expect(filterByType(items, "EXPENSE").map((i) => i.id)).toEqual([
      "e1",
      "f1",
    ]);
    expect(filterByType(items, "INCOME").map((i) => i.id)).toEqual([
      "i1",
      "fi",
    ]);
  });

  it("SHOULD filter by owner id", () => {
    expect(filterByOwner(items, "family-1").map((i) => i.id)).toEqual([
      "f1",
      "fi",
    ]);
  });

  it("SHOULD return nothing for an owner without transactions", () => {
    expect(filterByOwner(items, "nobody")).toEqual([]);
  });

  it("SHOULD combine owner then type", () => {
    const result = filterByType(filterByOwner(items, "family-1"), "EXPENSE");

    expect(result.map((i) => i.id)).toEqual(["f1"]);
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

  it("SHOULD format the month name alone in the active language", () => {
    expect(formatMonthName(new Date(2026, 9, 1), "en-US")).toBe("October");
    expect(formatMonthName(new Date(2026, 9, 1), "pt-BR")).toBe("outubro");
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

describe("card invoice lines (spec 029)", () => {
  it("SHOULD put the invoice in the day section of its list day, between account rows", () => {
    const entries = buildEntries(
      [
        tx("before", new Date(2026, 10, 6)),
        tx("same-day", new Date(2026, 10, 5)),
      ],
      now,
      [makeInvoice()],
    );

    expect(entries.map((entry) => entry.kind)).toEqual([
      "header",
      "item",
      "header",
      "item",
      "invoice",
    ]);
    const header = entries[2];
    expect(header.kind === "header" && header.netCents).toBe(-1000 - 45000);
  });

  it("SHOULD build a day with only an invoice", () => {
    const entries = buildEntries([], now, [makeInvoice()]);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ kind: "header", netCents: -45000 });
  });

  it("SHOULD hide invoices for the Income filter AND keep them for Expense and All", () => {
    const invoices = [makeInvoice()];

    expect(filterInvoicesByType(invoices, "INCOME")).toEqual([]);
    expect(filterInvoicesByType(invoices, "EXPENSE")).toBe(invoices);
    expect(filterInvoicesByType(invoices, "ALL")).toBe(invoices);
  });

  it("SHOULD filter invoices by the owner of the card", () => {
    const invoices = [makeInvoice()];

    expect(filterInvoicesByOwner(invoices, ALL_FILTER)).toBe(invoices);
    expect(filterInvoicesByOwner(invoices, "user-id")).toHaveLength(1);
    expect(filterInvoicesByOwner(invoices, "family-1")).toEqual([]);
  });
});

describe("projected occurrences (spec 034)", () => {
  function projectedRow(id: string, date: Date) {
    return new TransactionUIModel(
      new TransactionDTO({
        accountId: "a",
        category: "c",
        categoryId: "c",
        date: date.toISOString(),
        description: id,
        id,
        isProjected: true,
        owner: "USER",
        ownerId: "user-id",
        type: "EXPENSE",
        value: "100.00",
      }),
    );
  }
  const group = {
    card: {
      color: "#2B3A8C",
      id: "card-1",
      lastDigits: "1234",
      owner: "USER" as never,
      ownerId: "user-id",
      title: "Main card",
    },
    items: [projectedRow("netflix", new Date(2026, 9, 28))],
    listDate: "2026-11-05",
    referenceMonth: "2026-10",
  };

  it("SHOULD keep a projected row out of the net of its day", () => {
    const entries = buildEntries(
      [
        tx("real", new Date(2026, 10, 5)),
        projectedRow("p", new Date(2026, 10, 5)),
      ],
      new Date(2026, 10, 20),
    );
    const header = entries.find((entry) => entry.kind === "header");

    expect(header).toMatchObject({ netCents: -1000 });
    expect(entries.filter((entry) => entry.kind === "item")).toHaveLength(2);
  });

  it("SHOULD add the projections to the real invoice of the same card and month", () => {
    const [merged] = mergeProjectedInvoices([makeInvoice()], [group]);

    expect(merged.includesProjected).toBe(true);
    expect(merged.amountCents).toBe(45000 + 10000);
  });

  it("SHOULD leave an invoice of another month alone AND add a line for a projection with no real invoice", () => {
    const merged = mergeProjectedInvoices(
      [makeInvoice({ referenceMonth: "2026-09" })],
      [group],
    );

    expect(merged).toHaveLength(2);
    expect(merged[0].includesProjected).toBe(false);
    expect(merged[1]).toMatchObject({
      cardTitle: "Main card",
      isProjectedOnly: true,
      referenceMonth: "2026-10",
    });
    expect(merged[1].dateKey).toBe("2026-11-05");
    expect(merged[1].amountCents).toBe(10000);
  });

  it("SHOULD change nothing WHEN there are no projections", () => {
    const real = makeInvoice();

    expect(mergeProjectedInvoices([real], [])).toEqual([real]);
  });
});
