import {
  RECURRENCE_INTERVAL_MAX,
  RecurrenceFrequency,
  RecurrenceUnit,
} from "@domain/entities/financial/RecurrenceEntity";

// The schedule of spec 034 FR 3 (generalised to unit + interval by spec 114), mirrored from the API so the form can preview "12 times, last on ...".
// Occurrences always come from the START date and the occurrence number, never from the previous one.
const MS_PER_DAY = 86_400_000;
// Safety net for a "last on" preview of an absurd range (the API accepts any end date).
const MAX_PREVIEW_OCCURRENCES = 2000;

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

// Occurrence `k` (1-based) of a series that starts on `start`: `interval * (k - 1)` units after it.
function recurrenceOccurrenceDate(
  start: Date,
  frequency: RecurrenceFrequency,
  k: number,
) {
  const step = (k - 1) * frequency.interval;

  switch (frequency.unit) {
    case "DAY":
      return addDays(start, step);
    case "MONTH":
      return inMonth(
        start.getFullYear(),
        start.getMonth() + step,
        start.getDate(),
      );
    case "WEEK":
      return addDays(start, step * 7);
    case "YEAR":
      return inMonth(
        start.getFullYear() + step,
        start.getMonth(),
        start.getDate(),
      );
  }
}

// The occurrences after the first (the "Next:" preview), up to `limit`, honoring the end date.
function recurrenceNextDates(
  start: Date,
  frequency: RecurrenceFrequency,
  end: Date | undefined,
  limit: number,
) {
  const dates: Date[] = [];

  for (let k = 2; k <= limit + 1; k += 1) {
    const date = recurrenceOccurrenceDate(start, frequency, k);

    if (end && date > end) {
      break;
    }

    dates.push(date);
  }

  return dates;
}

// Switching unit keeps the number when it fits the new unit's range, else uses that unit's maximum.
function clampIntervalForUnit(unit: RecurrenceUnit, interval: number) {
  return Math.min(Math.max(interval, 1), RECURRENCE_INTERVAL_MAX[unit]);
}

export {
  clampIntervalForUnit,
  recurrenceLastDate,
  recurrenceNextDates,
  recurrenceOccurrenceCount,
  recurrenceOccurrenceDate,
};
