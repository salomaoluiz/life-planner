import {
  lastTwoYearsRange,
  monthDateRange,
  recentTransactionsRange,
  refundPurchasesRange,
} from "./TransactionQueryFilter";

it.each([
  ["2026-10", "2026-10-01", "2026-10-31"],
  ["2026-11", "2026-11-01", "2026-11-30"],
  ["2026-12", "2026-12-01", "2026-12-31"],
  ["2028-02", "2028-02-01", "2028-02-29"],
  ["2027-02", "2027-02-01", "2027-02-28"],
])("SHOULD give the first and last day of %s", (month, from, to) => {
  expect(monthDateRange(month)).toEqual({ from, to });
});

describe("lastTwoYearsRange (spec 078)", () => {
  it("SHOULD end today and start 2 years back plus one day", () => {
    expect(lastTwoYearsRange("2026-11-03")).toEqual({
      from: "2024-11-04",
      to: "2026-11-03",
    });
  });

  it("SHOULD stay valid on Feb 29", () => {
    const { from, to } = lastTwoYearsRange("2028-02-29");

    expect(to).toBe("2028-02-29");
    expect(from > "2026-02-28" && from <= "2026-03-02").toBe(true);
  });
});

describe("recentTransactionsRange (spec 078)", () => {
  it("SHOULD cover 24 whole months: 20 back, the current one and 3 ahead", () => {
    expect(recentTransactionsRange(new Date(2026, 10, 3))).toEqual({
      from: "2025-03-01",
      to: "2027-02-28",
    });
  });
});

describe("refundPurchasesRange (spec 077)", () => {
  it("SHOULD cover the purchases a refund can point at: 11 months back, this one and the next", () => {
    expect(refundPurchasesRange(new Date(2026, 10, 3))).toEqual({
      from: "2025-12-01",
      to: "2026-12-31",
    });
  });
});
