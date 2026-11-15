// Spec 110 FR 2-5: the same presets as the finance Overview, but no period goes past today and every preset ends
// today while it is the current one (1M = the 1st of the month -> today).
export interface InvestmentsPeriod {
  // `YYYY-MM-DD`, inclusive
  from: string;
  to: string;
}
export type InvestmentsPreset = "1M" | "3M" | "6M" | "12M" | "CUSTOM" | "YEAR";

export const INVESTMENTS_PRESETS: InvestmentsPreset[] = [
  "1M",
  "3M",
  "6M",
  "12M",
  "YEAR",
  "CUSTOM",
];
export const MAX_CUSTOM_YEARS = 10;
const MS_PER_DAY = 86_400_000;

export type CustomPeriodValidation =
  | { ok: false; reason: "future" | "order" | "range" }
  | { ok: true };
// Spec 110 FR 4: the next preset step exists only while it still starts on or before today.
export function canGoNext(
  preset: Exclude<InvestmentsPreset, "CUSTOM">,
  today: string,
  offset: number,
): boolean {
  return periodForPreset(preset, today, offset + 1).from <= today;
}
// Spec 110 FR 3: Jan 1 of last year -> today when the custom preset opens.
export function defaultCustomPeriod(today: string): InvestmentsPeriod {
  const [year] = today.split("-").map(Number);

  return { from: `${year - 1}-01-01`, to: today };
}
// Months the range touches, a partial month counting as one.
export function monthsBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00.000Z`);
  const b = new Date(`${to}T00:00:00.000Z`);

  return (
    (b.getUTCFullYear() - a.getUTCFullYear()) * 12 +
    (b.getUTCMonth() - a.getUTCMonth()) +
    1
  );
}
// The preset of the current date moved by `offset` steps (months, or years for YEAR): negative is the past.
export function periodForPreset(
  preset: Exclude<InvestmentsPreset, "CUSTOM">,
  today: string,
  offset = 0,
): InvestmentsPeriod {
  if (preset === "YEAR") {
    const year = addMonths(yearStart(today), offset * 12);

    return {
      from: yearStart(year),
      to: minDate(yearEnd(year), today),
    };
  }

  const months = { "1M": 1, "3M": 3, "6M": 6, "12M": 12 }[preset];
  const toMonth = addMonths(startOfMonth(today), months * offset);

  return {
    from: addMonths(startOfMonth(toMonth), -(months - 1)),
    to: minDate(endOfMonth(toMonth), today),
  };
}
// A custom range moves by its months when it covers whole months, otherwise by its days (the 055 rule).
export function shiftCustomPeriod(
  period: InvestmentsPeriod,
  direction: -1 | 1,
): InvestmentsPeriod {
  const from = new Date(`${period.from}T00:00:00.000Z`);
  const to = new Date(`${period.to}T00:00:00.000Z`);
  const wholeMonths =
    period.from === startOfMonth(period.from) &&
    period.to === endOfMonth(period.to);

  if (wholeMonths) {
    const months =
      (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
      to.getUTCMonth() -
      from.getUTCMonth() +
      1;

    return {
      from: startOfMonth(addMonths(period.from, months * direction)),
      to: endOfMonth(addMonths(period.from, months * direction + months - 1)),
    };
  }

  const days = daysBetween(period.from, period.to) * direction;

  return {
    from: addDays(period.from, days),
    to: addDays(period.to, days),
  };
}
// Spec 110 FR 3: at most 10 years and the end never after today.
export function validateCustomPeriod(
  from: string,
  to: string,
  today: string,
): CustomPeriodValidation {
  if (to < from) {
    return { ok: false, reason: "order" };
  }

  if (to > today) {
    return { ok: false, reason: "future" };
  }

  return from < addMonths(to, -MAX_CUSTOM_YEARS * 12)
    ? { ok: false, reason: "range" }
    : { ok: true };
}
function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);

  return value.toISOString().slice(0, 10);
}

function addMonths(date: string, months: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1 + months, day));

  return value.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return (
    Math.round(
      (new Date(`${to}T00:00:00.000Z`).getTime() -
        new Date(`${from}T00:00:00.000Z`).getTime()) /
        MS_PER_DAY,
    ) + 1
  );
}

// The last calendar day of the month of `date`.
function endOfMonth(date: string): string {
  const [year, month] = date.split("-").map(Number);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return `${date.slice(0, 7)}-${String(last).padStart(2, "0")}`;
}

function minDate(a: string, b: string): string {
  return a < b ? a : b;
}

function startOfMonth(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

function yearEnd(date: string): string {
  return `${date.slice(0, 4)}-12-31`;
}

function yearStart(date: string): string {
  return `${date.slice(0, 4)}-01-01`;
}
