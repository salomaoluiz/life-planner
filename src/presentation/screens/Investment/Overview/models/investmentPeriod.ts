import { toDateKey } from "@screens/Financial/Transactions/models/transactionFilters";

export type CustomPeriodValidation =
  | { maxTo: string; ok: false; reason: "future" | "order" | "tooLong" }
  | { ok: true };
export interface InvestmentPeriod {
  // `YYYY-MM-DD`, inclusive
  from: string;
  to: string;
}
export type InvestmentPreset = "1M" | "3M" | "6M" | "12M" | "CUSTOM" | "YEAR";

const MS_PER_DAY = 86_400_000;
const MAX_YEARS = 10;
const PRESET_MONTHS = { "1M": 1, "3M": 3, "6M": 6, "12M": 12 } as const;

// FR 4: the arrow forward works only when the next period starts on or before today.
function canShiftForward(next: InvestmentPeriod, today: string): boolean {
  return next.from <= today;
}

function daysIn(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY) + 1;
}

// FR 3: the range of the custom dialog when first opened.
function defaultCustomPeriod(today: string): InvestmentPeriod {
  const date = parse(today);

  return {
    from: toDateKey(new Date(date.getFullYear() - 1, 0, 1)),
    to: today,
  };
}

function isWholeMonths(period: InvestmentPeriod): boolean {
  const from = parse(period.from);
  const to = parse(period.to);

  return (
    from.getDate() === 1 &&
    new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate() === to.getDate()
  );
}

function monthsIn(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    1
  );
}

function parse(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

// Spec 110 FR 3 (difference from the finance 053): nothing ahead of today. NM = the current month and the N - 1
// before it, from the first day to today; Year = January 1 to today.
function periodForPreset(
  preset: Exclude<InvestmentPreset, "CUSTOM">,
  today: string,
): InvestmentPeriod {
  const date = parse(today);

  if (preset === "YEAR") {
    return { from: toDateKey(new Date(date.getFullYear(), 0, 1)), to: today };
  }

  return {
    from: toDateKey(
      new Date(
        date.getFullYear(),
        date.getMonth() - (PRESET_MONTHS[preset] - 1),
        1,
      ),
    ),
    to: today,
  };
}
// 055 FR 3: a custom range moves by its months when it covers whole months, otherwise by its days; it never ends
// after today.
function shiftCustomPeriod(
  period: InvestmentPeriod,
  direction: -1 | 1,
  today: string,
): InvestmentPeriod {
  const from = parse(period.from);
  const to = parse(period.to);
  const moved = isWholeMonths(period)
    ? shiftMonths(from, to, monthsIn(from, to) * direction)
    : shiftDays(from, to, daysIn(from, to) * direction);

  return { from: moved.from, to: moved.to < today ? moved.to : today };
}
function shiftDays(from: Date, to: Date, days: number): InvestmentPeriod {
  return {
    from: toDateKey(
      new Date(from.getFullYear(), from.getMonth(), from.getDate() + days),
    ),
    to: toDateKey(
      new Date(to.getFullYear(), to.getMonth(), to.getDate() + days),
    ),
  };
}
function shiftMonths(from: Date, to: Date, months: number): InvestmentPeriod {
  return {
    from: toDateKey(new Date(from.getFullYear(), from.getMonth() + months, 1)),
    to: toDateKey(new Date(to.getFullYear(), to.getMonth() + months + 1, 0)),
  };
}
// Spec 110 FR 3 + 055 FR 1-2: the period of the preset moved back by `offset` steps (N months, one year for Year).
// A step back always gives full months (full January-December for Year); offset 0 is the current period.
function shiftPresetPeriod(
  preset: Exclude<InvestmentPreset, "CUSTOM">,
  today: string,
  offset: number,
): InvestmentPeriod {
  const base = periodForPreset(preset, today);

  if (offset === 0) {
    return base;
  }

  const from = parse(base.from);
  const to = parse(base.to);

  if (preset === "YEAR") {
    return {
      from: toDateKey(new Date(from.getFullYear() + offset, 0, 1)),
      to: toDateKey(new Date(to.getFullYear() + offset, 11, 31)),
    };
  }

  const months = PRESET_MONTHS[preset] * offset;

  return {
    from: toDateKey(new Date(from.getFullYear(), from.getMonth() + months, 1)),
    to: toDateKey(new Date(to.getFullYear(), to.getMonth() + months + 1, 0)),
  };
}
// FR 3: up to 10 years, ending today at the latest; `maxTo` is the last valid end for the chosen start.
function validateCustomPeriod(
  from: string,
  to: string,
  today: string,
): CustomPeriodValidation {
  const [year, month, day] = from.split("-").map(Number);
  const rangeMax = toDateKey(new Date(year + MAX_YEARS, month - 1, day - 1));
  const maxTo = rangeMax < today ? rangeMax : today;

  if (to < from) {
    return { maxTo, ok: false, reason: "order" };
  }
  if (to > today) {
    return { maxTo, ok: false, reason: "future" };
  }

  return to <= rangeMax
    ? { ok: true }
    : { maxTo, ok: false, reason: "tooLong" };
}

export {
  canShiftForward,
  defaultCustomPeriod,
  periodForPreset,
  shiftCustomPeriod,
  shiftPresetPeriod,
  validateCustomPeriod,
};
