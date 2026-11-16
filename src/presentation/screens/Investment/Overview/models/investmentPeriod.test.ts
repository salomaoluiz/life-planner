import {
  canShiftForward,
  defaultCustomPeriod,
  periodForPreset,
  shiftCustomPeriod,
  shiftPresetPeriod,
  validateCustomPeriod,
} from "./investmentPeriod";

const TODAY = "2026-11-04";

describe("periodForPreset", () => {
  it.each([
    ["1M", "2026-11-01"],
    ["3M", "2026-09-01"],
    ["6M", "2026-06-01"],
    ["12M", "2025-12-01"],
    ["YEAR", "2026-01-01"],
  ] as const)(
    "SHOULD start %s on %s AND end today (no future)",
    (preset, from) => {
      expect(periodForPreset(preset, TODAY)).toEqual({ from, to: TODAY });
    },
  );

  it("SHOULD count the current month among the N", () => {
    expect(periodForPreset("12M", "2026-01-15")).toEqual({
      from: "2025-02-01",
      to: "2026-01-15",
    });
  });
});

describe("shiftPresetPeriod", () => {
  it("SHOULD give the current period at offset 0", () => {
    expect(shiftPresetPeriod("12M", TODAY, 0)).toEqual(
      periodForPreset("12M", TODAY),
    );
  });

  it.each([
    ["1M", -1, "2026-10-01", "2026-10-31"],
    ["1M", -2, "2026-09-01", "2026-09-30"],
    ["3M", -1, "2026-06-01", "2026-08-31"],
    ["12M", -1, "2024-12-01", "2025-11-30"],
    ["YEAR", -1, "2025-01-01", "2025-12-31"],
    ["YEAR", -2, "2024-01-01", "2024-12-31"],
  ] as const)(
    "SHOULD move %s by %i step(s) to the full months %s..%s",
    (preset, offset, from, to) => {
      expect(shiftPresetPeriod(preset, TODAY, offset)).toEqual({ from, to });
    },
  );

  it("SHOULD end a past February on its last day (leap year)", () => {
    expect(shiftPresetPeriod("1M", "2028-03-10", -1)).toEqual({
      from: "2028-02-01",
      to: "2028-02-29",
    });
  });
});

describe("canShiftForward", () => {
  it("SHOULD allow it only WHEN the next period starts on or before today", () => {
    expect(canShiftForward(shiftPresetPeriod("1M", TODAY, 1), TODAY)).toBe(
      false,
    );
    expect(canShiftForward(shiftPresetPeriod("1M", TODAY, 0), TODAY)).toBe(
      true,
    );
    expect(canShiftForward(shiftPresetPeriod("YEAR", TODAY, 1), TODAY)).toBe(
      false,
    );
  });
});

describe("shiftCustomPeriod", () => {
  it("SHOULD move whole months by their own length AND end no later than today", () => {
    const period = { from: "2026-01-01", to: "2026-06-30" };

    expect(shiftCustomPeriod(period, -1, TODAY)).toEqual({
      from: "2025-07-01",
      to: "2025-12-31",
    });
    expect(shiftCustomPeriod(period, 1, TODAY)).toEqual({
      from: "2026-07-01",
      to: TODAY,
    });
  });

  it("SHOULD move other ranges by their days", () => {
    expect(
      shiftCustomPeriod({ from: "2026-10-10", to: "2026-10-19" }, -1, TODAY),
    ).toEqual({ from: "2026-09-30", to: "2026-10-09" });
  });

  it("SHOULD not allow a step forward from a range that already ends today", () => {
    const next = shiftCustomPeriod({ from: "2026-07-01", to: TODAY }, 1, TODAY);

    expect(canShiftForward(next, TODAY)).toBe(false);
  });
});

it("SHOULD default the custom range to January 1 of last year until today", () => {
  expect(defaultCustomPeriod(TODAY)).toEqual({
    from: "2025-01-01",
    to: TODAY,
  });
});

describe("validateCustomPeriod", () => {
  it("SHOULD accept a range of up to 10 years ending today at the latest", () => {
    expect(validateCustomPeriod("2016-11-05", TODAY, TODAY)).toEqual({
      ok: true,
    });
    expect(validateCustomPeriod("2026-11-04", TODAY, TODAY)).toEqual({
      ok: true,
    });
  });

  it("SHOULD refuse an end before the start", () => {
    expect(
      validateCustomPeriod("2026-11-04", "2026-11-01", TODAY),
    ).toMatchObject({ ok: false, reason: "order" });
  });

  it("SHOULD refuse an end in the future AND point to today", () => {
    expect(validateCustomPeriod("2026-01-01", "2026-12-31", TODAY)).toEqual({
      maxTo: TODAY,
      ok: false,
      reason: "future",
    });
  });

  it("SHOULD refuse more than 10 years AND point to the last valid end", () => {
    expect(validateCustomPeriod("2016-11-04", TODAY, TODAY)).toEqual({
      maxTo: "2026-11-03",
      ok: false,
      reason: "tooLong",
    });
  });
});
