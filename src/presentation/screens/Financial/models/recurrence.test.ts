import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";

import {
  clampIntervalForUnit,
  recurrenceLastDate,
  recurrenceNextDates,
  recurrenceOccurrenceCount,
  recurrenceOccurrenceDate,
} from "./recurrence";

function day(year: number, month: number, date: number) {
  return new Date(year, month - 1, date);
}

const monthly: RecurrenceFrequency = { interval: 1, unit: "MONTH" };
const weekly: RecurrenceFrequency = { interval: 1, unit: "WEEK" };

describe("recurrenceOccurrenceDate", () => {
  it("SHOULD clamp a monthly 31st to the end of shorter months, always from the start", () => {
    const start = day(2026, 1, 31);

    expect(recurrenceOccurrenceDate(start, monthly, 1)).toEqual(
      day(2026, 1, 31),
    );
    expect(recurrenceOccurrenceDate(start, monthly, 2)).toEqual(
      day(2026, 2, 28),
    );
    expect(recurrenceOccurrenceDate(start, monthly, 3)).toEqual(
      day(2026, 3, 31),
    );
    expect(recurrenceOccurrenceDate(start, monthly, 4)).toEqual(
      day(2026, 4, 30),
    );
  });

  it("SHOULD use the 29th of February in a leap year AND roll over the year", () => {
    expect(recurrenceOccurrenceDate(day(2028, 1, 31), monthly, 2)).toEqual(
      day(2028, 2, 29),
    );
    expect(recurrenceOccurrenceDate(day(2026, 11, 15), monthly, 3)).toEqual(
      day(2027, 1, 15),
    );
  });

  it("SHOULD move a yearly 29 February to the 28th in non-leap years", () => {
    const start = day(2028, 2, 29);
    const yearly: RecurrenceFrequency = { interval: 1, unit: "YEAR" };

    expect(recurrenceOccurrenceDate(start, yearly, 2)).toEqual(
      day(2029, 2, 28),
    );
    expect(recurrenceOccurrenceDate(start, yearly, 5)).toEqual(
      day(2032, 2, 29),
    );
  });

  it("SHOULD step every 2 years from 29 February (AC 4)", () => {
    const biennial: RecurrenceFrequency = { interval: 2, unit: "YEAR" };

    expect(recurrenceOccurrenceDate(day(2028, 2, 29), biennial, 2)).toEqual(
      day(2030, 2, 28),
    );
    expect(recurrenceOccurrenceDate(day(2028, 2, 29), biennial, 3)).toEqual(
      day(2032, 2, 29),
    );
  });

  it("SHOULD add 7 days per week, crossing months", () => {
    expect(recurrenceOccurrenceDate(day(2026, 10, 1), weekly, 5)).toEqual(
      day(2026, 10, 29),
    );
    expect(
      recurrenceOccurrenceDate(
        day(2026, 10, 20),
        { interval: 2, unit: "WEEK" },
        2,
      ),
    ).toEqual(day(2026, 11, 3));
  });

  it("SHOULD step every 3 weeks (AC 2)", () => {
    const every3: RecurrenceFrequency = { interval: 3, unit: "WEEK" };
    const start = day(2026, 11, 12);

    expect(
      [2, 3, 4].map((k) => recurrenceOccurrenceDate(start, every3, k)),
    ).toEqual([day(2026, 12, 3), day(2026, 12, 24), day(2027, 1, 14)]);
  });

  it("SHOULD step every 2 months from the 31st (AC 3) AND every month from the 31st", () => {
    const bimonthly: RecurrenceFrequency = { interval: 2, unit: "MONTH" };
    const start = day(2027, 1, 31);

    expect(
      [2, 3, 4].map((k) => recurrenceOccurrenceDate(start, bimonthly, k)),
    ).toEqual([day(2027, 3, 31), day(2027, 5, 31), day(2027, 7, 31)]);
    expect(
      [2, 3].map((k) => recurrenceOccurrenceDate(start, monthly, k)),
    ).toEqual([day(2027, 2, 28), day(2027, 3, 31)]);
  });

  it("SHOULD step every N days", () => {
    expect(
      recurrenceOccurrenceDate(
        day(2026, 11, 12),
        { interval: 15, unit: "DAY" },
        3,
      ),
    ).toEqual(day(2026, 12, 12));
  });
});

describe("recurrenceOccurrenceCount / recurrenceLastDate", () => {
  it("SHOULD count a year of monthly occurrences AND find the last one", () => {
    const start = day(2026, 10, 5);
    const end = day(2027, 9, 5);

    expect(recurrenceOccurrenceCount(start, end, monthly)).toBe(12);
    expect(recurrenceLastDate(start, end, monthly)).toEqual(day(2027, 9, 5));
  });

  it("SHOULD count 7 occurrences every 2 months for a year (AC 1)", () => {
    const every2: RecurrenceFrequency = { interval: 2, unit: "MONTH" };

    expect(
      recurrenceOccurrenceCount(day(2026, 11, 12), day(2027, 11, 12), every2),
    ).toBe(7);
  });

  it("SHOULD count 6 occurrences every 15 days, the last on 26/01/2027 (AC 5)", () => {
    const every15: RecurrenceFrequency = { interval: 15, unit: "DAY" };
    const start = day(2026, 11, 12);
    const end = day(2027, 1, 26);

    expect(recurrenceOccurrenceCount(start, end, every15)).toBe(6);
    expect(recurrenceLastDate(start, end, every15)).toEqual(day(2027, 1, 26));
  });

  it("SHOULD stop before an end date that is not on the schedule", () => {
    expect(
      recurrenceLastDate(day(2026, 10, 5), day(2027, 9, 20), monthly),
    ).toEqual(day(2027, 9, 5));
  });

  it("SHOULD be 0 WHEN the end is before the start", () => {
    expect(
      recurrenceOccurrenceCount(day(2026, 10, 5), day(2026, 10, 4), weekly),
    ).toBe(0);
    expect(
      recurrenceLastDate(day(2026, 10, 5), day(2026, 10, 4), weekly),
    ).toBeUndefined();
  });

  it("SHOULD stop counting at a safety limit for an absurd range", () => {
    expect(
      recurrenceOccurrenceCount(day(2026, 1, 1), day(2999, 1, 1), weekly),
    ).toBe(2000);
  });
});

describe("recurrenceNextDates", () => {
  it("SHOULD list the occurrences after the first, up to the limit", () => {
    expect(
      recurrenceNextDates(
        day(2026, 11, 12),
        { interval: 2, unit: "MONTH" },
        day(2027, 11, 12),
        3,
      ),
    ).toEqual([day(2027, 1, 12), day(2027, 3, 12), day(2027, 5, 12)]);
  });

  it("SHOULD stop at the end date AND work without one", () => {
    expect(
      recurrenceNextDates(day(2026, 11, 12), weekly, day(2026, 11, 20), 3),
    ).toEqual([day(2026, 11, 19)]);
    expect(
      recurrenceNextDates(
        day(2026, 11, 12),
        { interval: 3, unit: "WEEK" },
        undefined,
        3,
      ),
    ).toEqual([day(2026, 12, 3), day(2026, 12, 24), day(2027, 1, 14)]);
  });
});

describe("clampIntervalForUnit", () => {
  it.each([
    ["MONTH", 30, 24],
    ["YEAR", 5, 5],
    ["DAY", 400, 365],
    ["WEEK", 60, 52],
    ["DAY", 1, 1],
  ] as const)("SHOULD turn %s %i into %i", (unit, interval, expected) => {
    expect(clampIntervalForUnit(unit, interval)).toBe(expected);
  });
});
