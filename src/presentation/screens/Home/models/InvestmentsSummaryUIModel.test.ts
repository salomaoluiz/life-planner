import { InvestmentsHomeSummary } from "@domain/entities/investment/InvestmentEntities";

import InvestmentsSummaryUIModel from "./InvestmentsSummaryUIModel";

const now = new Date(2026, 10, 4, 18, 0);

function model(overrides: Partial<InvestmentsHomeSummary> = {}, tag = "pt-BR") {
  return new InvestmentsSummaryUIModel(summary(overrides), now, tag);
}
function summary(
  overrides: Partial<InvestmentsHomeSummary> = {},
): InvestmentsHomeSummary {
  return {
    currentValueCents: 18432055,
    hasPositions: true,
    income: {
      count: 6,
      month: "2026-11",
      pendingSuggestions: 2,
      totalCents: 128430,
    },
    investedCents: 16290000,
    nextMaturity: {
      assetId: "asset-1",
      currency: "BRL",
      maturityDate: "2026-12-15",
      name: "CDB",
      netEstimatedCents: 2187010,
    },
    quotes: {
      asOf: new Date(2026, 10, 4, 16, 5),
      manualCount: 2,
      stale: false,
      withoutPrice: 0,
    },
    resultBasisPoints: 1315,
    resultCents: 2142055,
    ...overrides,
  };
}

describe("result", () => {
  it("SHOULD be income-toned with a signed percentage WHEN it is positive", () => {
    expect(model().resultTone).toBe("income");
    expect(model().resultPercent).toBe("+13,15%");
    expect(model({}, "en-US").resultPercent).toBe("+13.15%");
  });

  it("SHOULD be expense-toned with a minus sign WHEN it is negative", () => {
    const negative = model({ resultBasisPoints: -844, resultCents: -380000 });

    expect(negative.resultTone).toBe("expense");
    expect(negative.resultPercent).toBe("−8,44%");
  });

  it("SHOULD treat zero as income-toned with no sign", () => {
    const zero = model({ resultBasisPoints: 0, resultCents: 0 });

    expect(zero.resultTone).toBe("income");
    expect(zero.resultPercent).toBe("0,00%");
  });

  it("SHOULD have no percentage WHEN there is no cost", () => {
    expect(
      model({ resultBasisPoints: undefined }).resultPercent,
    ).toBeUndefined();
  });
});

describe("footer", () => {
  it("SHOULD say today with the time of the oldest quote AND carry the manual count", () => {
    expect(model().footer).toEqual({
      manualCount: 2,
      stale: false,
      when: { date: "4 de nov.", kind: "today", time: "16:05" },
    });
  });

  it("SHOULD say yesterday, AND a date for older quotes", () => {
    const yesterday = model({
      quotes: {
        asOf: new Date(2026, 10, 3, 18, 0),
        manualCount: 0,
        stale: true,
        withoutPrice: 0,
      },
    }).footer;
    const older = model({
      quotes: {
        asOf: new Date(2026, 9, 30, 18, 0),
        manualCount: 0,
        stale: true,
        withoutPrice: 0,
      },
    }).footer;

    expect(yesterday).toMatchObject({
      stale: true,
      when: { kind: "yesterday", time: "18:00" },
    });
    expect(older.when).toMatchObject({ kind: "date", time: "18:00" });
    expect(older.when?.date).toContain("30");
  });

  it("SHOULD have no when WHEN no quote was used", () => {
    expect(
      model({
        quotes: { manualCount: 1, stale: false, withoutPrice: 0 },
      }).footer.when,
    ).toBeUndefined();
  });
});

describe("income", () => {
  it("SHOULD carry the month name, total, count and pending suggestions", () => {
    expect(model().income).toEqual({
      count: 6,
      isEmpty: false,
      monthName: "novembro",
      pendingSuggestions: 2,
      totalCents: 128430,
    });
  });

  it("SHOULD be empty WHEN nothing was received", () => {
    const empty = model({
      income: {
        count: 0,
        month: "2026-11",
        pendingSuggestions: 0,
        totalCents: 0,
      },
    }).income;

    expect(empty.isEmpty).toBe(true);
  });
});

describe("maturity", () => {
  it("SHOULD give the date label AND the calendar days left", () => {
    expect(model().maturity).toEqual({
      assetId: "asset-1",
      currency: "BRL",
      dateLabel: "15 de dez. de 2026",
      days: 41,
      name: "CDB",
      netEstimatedCents: 2187010,
    });
  });

  it("SHOULD be 0 days WHEN it matures today", () => {
    expect(
      model({
        nextMaturity: {
          assetId: "a",
          currency: "BRL",
          maturityDate: "2026-11-04",
          name: "CDB",
          netEstimatedCents: 1,
        },
      }).maturity?.days,
    ).toBe(0);
  });

  it("SHOULD be undefined WHEN there is none", () => {
    expect(model({ nextMaturity: undefined }).maturity).toBeUndefined();
  });
});

it("SHOULD be empty WHEN there are no positions", () => {
  expect(model({ hasPositions: false }).isEmpty).toBe(true);
  expect(model().isEmpty).toBe(false);
});
