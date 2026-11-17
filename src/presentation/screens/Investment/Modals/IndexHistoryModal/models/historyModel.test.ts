import { InvestmentMarketIndexHistory } from "@domain/entities/investment/InvestmentEntities";

import {
  chartPoints,
  deltaLabel,
  HISTORY_PERIODS,
  historyRange,
} from "./historyModel";

describe("historyRange", () => {
  it("SHOULD end today AND start the matching months back", () => {
    expect(historyRange("6m", "2026-11-16")).toEqual({
      from: "2026-05-16",
      to: "2026-11-16",
    });
    expect(historyRange("12m", "2026-11-16")).toEqual({
      from: "2025-11-16",
      to: "2026-11-16",
    });
    expect(historyRange("5y", "2026-11-16")).toEqual({
      from: "2021-11-16",
      to: "2026-11-16",
    });
  });

  it("SHOULD stay inside the 30 years of the API for the whole history", () => {
    const { from, to } = historyRange("first", "2026-11-16");

    expect(from).toBe("1996-11-16");
    expect(to > from).toBe(true);
  });

  it("SHOULD clamp the day WHEN the month is shorter", () => {
    expect(historyRange("6m", "2026-08-31").from).toBe("2026-02-28");
  });

  it("SHOULD list the four periods of the artboard in order", () => {
    expect(HISTORY_PERIODS).toEqual(["6m", "12m", "5y", "first"]);
  });
});

describe("chartPoints", () => {
  it("SHOULD plot the steps of the CDI AND the monthly IPCA", () => {
    const steps = {
      changes: [],
      followers: [],
      index: "CDI",
      points: [{ date: "2026-03-19", value: "14.15" }],
    } as InvestmentMarketIndexHistory;
    const months = {
      changes: [],
      followers: [],
      index: "IPCA",
      points: [
        { accumulated12m: "4.63", month: "2026-10", monthly: "0.14" },
        {},
      ],
    } as InvestmentMarketIndexHistory;

    expect(chartPoints(steps, (value) => `L${value}`)).toEqual([
      { label: "L2026-03-19", projected: false, value: 14.15 },
    ]);
    expect(chartPoints(months, (value) => value)).toEqual([
      { label: "2026-10", projected: false, value: 0.14 },
    ]);
  });
});

describe("deltaLabel", () => {
  it("SHOULD write the sign AND the locale, a dash for the first change", () => {
    expect(deltaLabel("0.75", "pt-BR")).toBe("+0,75");
    expect(deltaLabel("-0.50", "en-US")).toBe("−0.50");
    expect(deltaLabel(null, "pt-BR")).toBe("—");
  });
});
