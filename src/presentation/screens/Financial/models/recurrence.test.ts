import {
  recurrenceLastDate,
  recurrenceOccurrenceCount,
  recurrenceOccurrenceDate,
} from "./recurrence";

function day(year: number, month: number, date: number) {
  return new Date(year, month - 1, date);
}

describe("recurrenceOccurrenceDate", () => {
  it("SHOULD clamp a monthly 31st to the end of shorter months, always from the start", () => {
    const start = day(2026, 1, 31);

    expect(recurrenceOccurrenceDate(start, "MONTHLY", 1)).toEqual(
      day(2026, 1, 31),
    );
    expect(recurrenceOccurrenceDate(start, "MONTHLY", 2)).toEqual(
      day(2026, 2, 28),
    );
    expect(recurrenceOccurrenceDate(start, "MONTHLY", 3)).toEqual(
      day(2026, 3, 31),
    );
    expect(recurrenceOccurrenceDate(start, "MONTHLY", 4)).toEqual(
      day(2026, 4, 30),
    );
  });

  it("SHOULD use the 29th of February in a leap year AND roll over the year", () => {
    expect(recurrenceOccurrenceDate(day(2028, 1, 31), "MONTHLY", 2)).toEqual(
      day(2028, 2, 29),
    );
    expect(recurrenceOccurrenceDate(day(2026, 11, 15), "MONTHLY", 3)).toEqual(
      day(2027, 1, 15),
    );
  });

  it("SHOULD move a yearly 29 February to the 28th in non-leap years", () => {
    const start = day(2028, 2, 29);

    expect(recurrenceOccurrenceDate(start, "YEARLY", 2)).toEqual(
      day(2029, 2, 28),
    );
    expect(recurrenceOccurrenceDate(start, "YEARLY", 5)).toEqual(
      day(2032, 2, 29),
    );
  });

  it("SHOULD add 7 days for weekly and 14 for biweekly, crossing months", () => {
    expect(recurrenceOccurrenceDate(day(2026, 10, 1), "WEEKLY", 5)).toEqual(
      day(2026, 10, 29),
    );
    expect(recurrenceOccurrenceDate(day(2026, 10, 20), "BIWEEKLY", 2)).toEqual(
      day(2026, 11, 3),
    );
  });
});

describe("recurrenceOccurrenceCount / recurrenceLastDate", () => {
  it("SHOULD count a year of monthly occurrences AND find the last one", () => {
    const start = day(2026, 10, 5);
    const end = day(2027, 9, 5);

    expect(recurrenceOccurrenceCount(start, end, "MONTHLY")).toBe(12);
    expect(recurrenceLastDate(start, end, "MONTHLY")).toEqual(day(2027, 9, 5));
  });

  it("SHOULD stop before an end date that is not on the schedule", () => {
    expect(
      recurrenceLastDate(day(2026, 10, 5), day(2027, 9, 20), "MONTHLY"),
    ).toEqual(day(2027, 9, 5));
  });

  it("SHOULD be 0 WHEN the end is before the start", () => {
    expect(
      recurrenceOccurrenceCount(day(2026, 10, 5), day(2026, 10, 4), "WEEKLY"),
    ).toBe(0);
    expect(
      recurrenceLastDate(day(2026, 10, 5), day(2026, 10, 4), "WEEKLY"),
    ).toBeUndefined();
  });

  it("SHOULD stop counting at a safety limit for an absurd range", () => {
    expect(
      recurrenceOccurrenceCount(day(2026, 1, 1), day(2999, 1, 1), "WEEKLY"),
    ).toBe(2000);
  });
});
