import {
  aggregateOf,
  amountProps,
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
