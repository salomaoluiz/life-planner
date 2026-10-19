import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";

// The schedule of spec 034 FR 3, mirrored from the API so the form can preview "12 times, last on ...".
// Occurrences always come from the START date and the occurrence number, never from the previous one.
const MS_PER_DAY = 86_400_000;
// Safety net for a "last on" preview of an absurd range (the API accepts any end date).
const MAX_PREVIEW_OCCURRENCES = 2000;

export const RECURRENCE_FREQUENCIES: RecurrenceFrequency[] = [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "YEARLY",
];

function addDays(date: Date, days: number) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const next = new Date(utc + days * MS_PER_DAY);

  return new Date(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate());
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Month-end clamp: 31 Jan -> 28/29 Feb -> 31 Mar; 29 Feb yearly -> 28 Feb in non-leap years.
function inMonth(year: number, monthIndex: number, day: number) {
  const absolute = year * 12 + monthIndex;
  const targetYear = Math.floor(absolute / 12);
  const targetMonth = absolute - targetYear * 12;

  return new Date(
    targetYear,
    targetMonth,
    Math.min(day, daysInMonth(targetYear, targetMonth)),
  );
}

// The date of the last occurrence up to `end`, undefined when there is none.
function recurrenceLastDate(
  start: Date,
  end: Date,
  frequency: RecurrenceFrequency,
) {
  const count = recurrenceOccurrenceCount(start, end, frequency);

  return count > 0
    ? recurrenceOccurrenceDate(start, frequency, count)
    : undefined;
}

// How many occurrences are dated up to `end` (inclusive); 0 when the end is before the start.
function recurrenceOccurrenceCount(
  start: Date,
  end: Date,
  frequency: RecurrenceFrequency,
) {
  let count = 0;

  while (
    count < MAX_PREVIEW_OCCURRENCES &&
    recurrenceOccurrenceDate(start, frequency, count + 1) <= end
  ) {
    count += 1;
  }

  return count;
}

// Occurrence `k` (1-based) of a series that starts on `start`.
function recurrenceOccurrenceDate(
  start: Date,
  frequency: RecurrenceFrequency,
  k: number,
) {
  const step = k - 1;

  switch (frequency) {
    case "BIWEEKLY":
      return addDays(start, step * 14);
    case "MONTHLY":
      return inMonth(
        start.getFullYear(),
        start.getMonth() + step,
        start.getDate(),
      );
    case "WEEKLY":
      return addDays(start, step * 7);
    case "YEARLY":
      return inMonth(
        start.getFullYear() + step,
        start.getMonth(),
        start.getDate(),
      );
  }
}

export {
  recurrenceLastDate,
  recurrenceOccurrenceCount,
  recurrenceOccurrenceDate,
};
