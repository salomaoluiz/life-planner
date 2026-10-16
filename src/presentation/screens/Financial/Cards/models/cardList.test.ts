import {
  aggregateOf,
  amountProps,
  buildCardEntries,
  filterCardsByOwner,
  filterSummariesByOwner,
  formatDayMonth,
  formatReferenceMonth,
  resolveSelectedId,
  usedProgress,
} from "./cardList";

function summary(id: string, ownerId: string, limit: number, used: number) {
  return {
    available: limit - used,
    card: { id, limit, ownerId },
    closedInvoices: [],
    openInvoice: {},
    used,
  } as never;
}

const a = summary("a", "u1", 500000, 100000);
const b = summary("b", "f1", 300000, 0);

describe("filterSummariesByOwner", () => {
  it("SHOULD keep everything for ALL AND only the owner's cards otherwise", () => {
    expect(filterSummariesByOwner([a, b], "ALL")).toEqual([a, b]);
    expect(filterSummariesByOwner([a, b], "f1")).toEqual([b]);
  });
});

describe("filterCardsByOwner", () => {
  it("SHOULD filter archived cards by owner", () => {
    const cards = [
      { id: "x", ownerId: "u1" },
      { id: "y", ownerId: "f1" },
    ] as never[];

    expect(filterCardsByOwner(cards, "u1")).toEqual([cards[0]]);
    expect(filterCardsByOwner(cards, "ALL")).toEqual(cards);
  });
});

describe("aggregateOf", () => {
  it("SHOULD sum limit and used AND derive available", () => {
    expect(aggregateOf([a, b])).toEqual({
      available: 700000,
      totalLimit: 800000,
      used: 100000,
    });
  });

  it("SHOULD be all zeros WHEN there are no cards", () => {
    expect(aggregateOf([])).toEqual({ available: 0, totalLimit: 0, used: 0 });
  });
});

describe("usedProgress", () => {
  it("SHOULD be used / totalLimit AND 0 WHEN the limit is 0", () => {
    expect(usedProgress({ available: 0, totalLimit: 400, used: 100 })).toBe(
      0.25,
    );
    expect(usedProgress({ available: 0, totalLimit: 0, used: 0 })).toBe(0);
  });
});

describe("resolveSelectedId", () => {
  it("SHOULD keep a valid selection, fall back to the first card, and be undefined with no cards", () => {
    expect(resolveSelectedId([a, b], "b")).toBe("b");
    expect(resolveSelectedId([a, b], "gone")).toBe("a");
    expect(resolveSelectedId([a, b], undefined)).toBe("a");
    expect(resolveSelectedId([], "a")).toBeUndefined();
  });
});

describe("amountProps", () => {
  it("SHOULD flag negative cents as an expense with the absolute value", () => {
    expect(amountProps(-250)).toEqual({ type: "EXPENSE", value: 250 });
    expect(amountProps(500)).toEqual({ value: 500 });
  });
});

describe("formatDayMonth", () => {
  it("SHOULD render dd/MM from an ISO date", () => {
    expect(formatDayMonth("2026-10-31")).toBe("31/10");
    expect(formatDayMonth("2027-01-05")).toBe("05/01");
  });
});

describe("formatReferenceMonth", () => {
  it("SHOULD render the month and year in the given language", () => {
    const label = formatReferenceMonth("2026-10", "en-US");

    expect(label).toContain("Oct");
    expect(label).toContain("2026");
  });
});

describe("buildCardEntries", () => {
  function invoice(referenceMonth: string) {
    return { referenceMonth, status: "OPEN" } as never;
  }
  const selected = {
    card: { id: "a" },
    closedInvoices: [invoice("2026-09"), invoice("2026-08")],
    openInvoice: invoice("2026-10"),
    upcomingInvoices: [invoice("2026-11"), invoice("2026-12")],
  } as never;
  const archived = [{ id: "z" }, { id: "y" }] as never[];

  it("SHOULD list only the open invoice on the open tab", () => {
    const entries = buildCardEntries({
      archived: [],
      archivedExpanded: false,
      invoiceTab: "open",
      selected,
    });

    expect(entries.map((entry) => entry.kind)).toEqual(["invoice"]);
  });

  it("SHOULD list the closed invoices newest first on the closed tab, or noClosed WHEN there are none", () => {
    const closed = buildCardEntries({
      archived: [],
      archivedExpanded: false,
      invoiceTab: "closed",
      selected,
    });
    const none = buildCardEntries({
      archived: [],
      archivedExpanded: false,
      invoiceTab: "closed",
      selected: { ...(selected as object), closedInvoices: [] } as never,
    });

    expect(closed.map((entry) => entry.kind)).toEqual(["invoice", "invoice"]);
    expect(none.map((entry) => entry.kind)).toEqual(["noClosed"]);
  });

  it("SHOULD add the archived toggle AND the rows only WHEN expanded", () => {
    const collapsed = buildCardEntries({
      archived,
      archivedExpanded: false,
      invoiceTab: "open",
      selected: undefined,
    });
    const expanded = buildCardEntries({
      archived,
      archivedExpanded: true,
      invoiceTab: "open",
      selected: undefined,
    });

    expect(collapsed).toEqual([
      {
        count: 2,
        expanded: false,
        key: "archived-toggle",
        kind: "archivedToggle",
      },
    ]);
    expect(expanded.map((entry) => entry.kind)).toEqual([
      "archivedToggle",
      "archivedRow",
      "archivedRow",
    ]);
  });

  it("SHOULD be empty WHEN there is no selected card and nothing archived", () => {
    expect(
      buildCardEntries({
        archived: [],
        archivedExpanded: false,
        invoiceTab: "open",
        selected: undefined,
      }),
    ).toEqual([]);
  });
});

describe("upcoming tab (spec 029)", () => {
  function invoice(referenceMonth: string) {
    return { referenceMonth, status: "OPEN" } as never;
  }
  const selected = {
    card: { id: "a" },
    closedInvoices: [],
    openInvoice: invoice("2026-10"),
    upcomingInvoices: [invoice("2026-11"), invoice("2026-12")],
  } as never;

  it("SHOULD list the upcoming invoices with their card id", () => {
    const entries = buildCardEntries({
      archived: [],
      archivedExpanded: false,
      invoiceTab: "upcoming",
      selected,
    });

    expect(entries.map((entry) => entry.kind)).toEqual(["invoice", "invoice"]);
    expect(entries[0]).toMatchObject({ cardId: "a" });
  });

  it("SHOULD show noUpcoming WHEN there are none", () => {
    const entries = buildCardEntries({
      archived: [],
      archivedExpanded: false,
      invoiceTab: "upcoming",
      selected: { ...(selected as object), upcomingInvoices: [] } as never,
    });

    expect(entries.map((entry) => entry.kind)).toEqual(["noUpcoming"]);
  });
});
