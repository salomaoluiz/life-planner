import {
  canGoNext,
  defaultCustomPeriod,
  periodForPreset,
  shiftCustomPeriod,
  validateCustomPeriod,
} from "./investmentsPeriod";

const today = "2026-11-04";

describe("periodForPreset (spec 110)", () => {
  it("SHOULD end today AND start on the 1st for 1M", () => {
    expect(periodForPreset("1M", today)).toEqual({
      from: "2026-11-01",
      to: "2026-11-04",
    });
  });

  it("SHOULD start N - 1 months back AND end today for 3M, 6M and 12M", () => {
    expect(periodForPreset("3M", today)).toEqual({
      from: "2026-09-01",
      to: "2026-11-04",
    });
    expect(periodForPreset("6M", today)).toEqual({
      from: "2026-06-01",
      to: "2026-11-04",
    });
    expect(periodForPreset("12M", today)).toEqual({
      from: "2025-12-01",
      to: "2026-11-04",
    });
  });

  it("SHOULD take the whole previous month WHEN moved one step back", () => {
    expect(periodForPreset("1M", today, -1)).toEqual({
      from: "2026-10-01",
      to: "2026-10-31",
    });
  });

  it("SHOULD use January 1 to today for the current year AND the full year for a past one", () => {
    expect(periodForPreset("YEAR", today)).toEqual({
      from: "2026-01-01",
      to: "2026-11-04",
    });
    expect(periodForPreset("YEAR", today, -1)).toEqual({
      from: "2025-01-01",
      to: "2025-12-31",
    });
  });

  it("SHOULD refuse a forward step that would start after today", () => {
    expect(canGoNext("12M", today, -1)).toBe(true);
    expect(canGoNext("12M", today, 0)).toBe(false);
    expect(canGoNext("YEAR", today, -1)).toBe(true);
    expect(canGoNext("YEAR", today, 0)).toBe(false);
  });
});

describe("custom period", () => {
  it("SHOULD open on January 1 of last year up to today", () => {
    expect(defaultCustomPeriod(today)).toEqual({
      from: "2025-01-01",
      to: today,
    });
  });

  it("SHOULD accept up to 10 years AND refuse a future end, an inverted range and a longer one", () => {
    expect(validateCustomPeriod("2016-11-05", today, today).ok).toBe(true);
    expect(validateCustomPeriod("2016-10-01", today, today)).toEqual({
      ok: false,
      reason: "range",
    });
    expect(validateCustomPeriod("2026-01-01", "2026-12-01", today)).toEqual({
      ok: false,
      reason: "future",
    });
    expect(validateCustomPeriod(today, "2026-01-01", today)).toEqual({
      ok: false,
      reason: "order",
    });
  });

  it("SHOULD move whole months by months AND other ranges by days", () => {
    expect(
      shiftCustomPeriod({ from: "2026-01-01", to: "2026-03-31" }, -1),
    ).toEqual({ from: "2025-10-01", to: "2025-12-31" });
    expect(
      shiftCustomPeriod({ from: "2026-01-10", to: "2026-02-09" }, 1),
    ).toEqual({ from: "2026-02-10", to: "2026-03-12" });
  });
});
