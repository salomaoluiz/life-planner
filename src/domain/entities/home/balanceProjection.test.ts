import { DailyBalanceDayEntity } from "@domain/entities/financial/DailyBalanceEntity";

import {
  deriveBreakdown,
  lowestBalanceDay,
  projectedEndOfMonth,
} from "./balanceProjection";

function day(date: string, totalCents: number): DailyBalanceDayEntity {
  return {
    accounts: [{ accountId: "account-id", balanceCents: totalCents }],
    cardsDueCents: 0,
    date,
    projected: false,
    totalCents,
  };
}

describe("projectedEndOfMonth", () => {
  it("SHOULD return the total of the last day of the month", () => {
    expect(
      projectedEndOfMonth([
        day("2026-11-30", 80000),
        day("2026-11-01", 100000),
        day("2026-11-15", -5000),
      ]),
    ).toBe(80000);
  });

  it("SHOULD be undefined without days", () => {
    expect(projectedEndOfMonth([])).toBeUndefined();
  });

  it("SHOULD NOT turn a big income of last month and a big expense of this month into a debt", () => {
    // Money of last month is still in the accounts: the last day total is what counts, not income - expense.
    const income = 1000000;
    const expense = 900000;

    expect(projectedEndOfMonth([day("2026-11-30", 350000)])).toBe(350000);
    expect(income - expense).not.toBe(350000);
  });
});

describe("deriveBreakdown", () => {
  it("SHOULD keep the numbers when they add up (1.000 + 300 − 500 = 800)", () => {
    expect(
      deriveBreakdown({
        currentCents: 100000,
        projectedEndCents: 80000,
        toPayCents: 50000,
        toReceiveCents: 30000,
      }),
    ).toEqual({
      currentCents: 100000,
      toPayCents: 50000,
      toReceiveCents: 30000,
    });
  });

  it("SHOULD derive what is to pay when the sources disagree", () => {
    expect(
      deriveBreakdown({
        currentCents: 100000,
        projectedEndCents: 78000,
        toPayCents: 50000,
        toReceiveCents: 30000,
      }),
    ).toEqual({
      currentCents: 100000,
      toPayCents: 52000,
      toReceiveCents: 30000,
    });
  });

  it("SHOULD derive what is to receive when to pay would be negative", () => {
    expect(
      deriveBreakdown({
        currentCents: 100000,
        projectedEndCents: 150000,
        toPayCents: 0,
        toReceiveCents: 30000,
      }),
    ).toEqual({ currentCents: 100000, toPayCents: 0, toReceiveCents: 50000 });
  });
});

describe("lowestBalanceDay", () => {
  const days = [
    day("2026-11-03", -90000),
    day("2026-11-12", 50000),
    day("2026-11-20", 20000),
    day("2026-11-25", 20000),
  ];

  it("SHOULD ignore days before the start date", () => {
    expect(lowestBalanceDay(days, "2026-11-12")?.date).toBe("2026-11-20");
  });

  it("SHOULD pick the earliest day on a tie", () => {
    expect(lowestBalanceDay([...days].reverse(), "2026-11-12")?.date).toBe(
      "2026-11-20",
    );
  });

  it("SHOULD keep a negative total and the accounts of that day", () => {
    expect(lowestBalanceDay(days, "2026-11-01")).toEqual({
      accounts: [{ accountId: "account-id", balanceCents: -90000 }],
      date: "2026-11-03",
      totalCents: -90000,
    });
  });

  it("SHOULD handle today being the last day of the month", () => {
    expect(lowestBalanceDay(days, "2026-11-25")?.date).toBe("2026-11-25");
  });

  it("SHOULD be undefined without days from the start date", () => {
    expect(lowestBalanceDay(days, "2026-12-01")).toBeUndefined();
    expect(lowestBalanceDay([], "2026-11-01")).toBeUndefined();
  });
});
