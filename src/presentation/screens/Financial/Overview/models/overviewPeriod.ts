import { DashboardGranularity } from "@domain/entities/financial/DashboardEntity";
import {
  toDateKey,
  validatePeriod,
} from "@screens/Financial/Transactions/models/transactionFilters";

export interface GranularityOption {
  enabled: boolean;
  // The hint shown when the option is disabled
  hintKey?: "day" | "week";
  value: DashboardGranularity;
}
export interface OverviewPeriod {
  // `YYYY-MM-DD`, inclusive
  from: string;
  to: string;
}
export type OverviewPreset = "1M" | "3M" | "6M" | "12M" | "CUSTOM" | "YEAR";

const MS_PER_DAY = 86_400_000;
const MAX_DAY_SPAN = 92;
const MAX_WEEK_SPAN = 366;

function daysBetween(from: string, to: string): number {
  return (
    Math.round((parse(to).getTime() - parse(from).getTime()) / MS_PER_DAY) + 1
  );
}

// Day only up to 92 days, Week up to a year (spec 046 FR 12).
function defaultGranularity(from: string, to: string): DashboardGranularity {
  const days = daysBetween(from, to);

  if (days <= 31) {
    return "DAY";
  }

  return days <= MAX_DAY_SPAN ? "WEEK" : "MONTH";
}

// The last day of the month `months` after the month of `today`.
function endOfMonthAfter(today: string, months: number): string {
  const date = parse(today);

  return toDateKey(
    new Date(date.getFullYear(), date.getMonth() + months + 1, 0),
  );
}

function granularityOptions(from: string, to: string): GranularityOption[] {
  const days = daysBetween(from, to);

  return [
    {
      enabled: days <= MAX_DAY_SPAN,
      hintKey: days <= MAX_DAY_SPAN ? undefined : "day",
      value: "DAY",
    },
    {
      enabled: days <= MAX_WEEK_SPAN,
      hintKey: days <= MAX_WEEK_SPAN ? undefined : "week",
      value: "WEEK",
    },
    { enabled: true, value: "MONTH" },
  ];
}

// Spec 053 FR 7: the latest end a period may have (the last day of the month 24 months after the current one).
function maxFutureDate(today: string): string {
  return endOfMonthAfter(today, 24);
}

// The calendar months the period touches (spec 052 FR 17): a partial month counts as one.
function monthsInPeriod(period: OverviewPeriod): number {
  const from = parse(period.from);
  const to = parse(period.to);

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

// Spec 053 FR 2-3: NM = N months back (the current one counts) and N ahead; Year = January to December.
function periodForPreset(
  preset: Exclude<OverviewPreset, "CUSTOM">,
  today: string,
): OverviewPeriod {
  const date = parse(today);

  if (preset === "YEAR") {
    return {
      from: toDateKey(new Date(date.getFullYear(), 0, 1)),
      to: toDateKey(new Date(date.getFullYear(), 11, 31)),
    };
  }

  const months = { "1M": 1, "3M": 3, "6M": 6, "12M": 12 }[preset];

  return {
    from: toDateKey(
      new Date(date.getFullYear(), date.getMonth() - (months - 1), 1),
    ),
    to: endOfMonthAfter(today, months),
  };
}

// The custom range: at most 2 years (the 045 rule) and an end no later than `maxFutureDate`.
function validateCustomPeriod(
  from: string,
  to: string,
  today: string,
): { maxTo: string; ok: false } | { ok: true } {
  const limit = maxFutureDate(today);
  const validation = validatePeriod(from, to);

  if (!validation.ok) {
    return {
      maxTo: validation.maxTo < limit ? validation.maxTo : limit,
      ok: false,
    };
  }

  return to <= limit ? { ok: true } : { maxTo: limit, ok: false };
}

export {
  defaultGranularity,
  granularityOptions,
  maxFutureDate,
  monthsInPeriod,
  periodForPreset,
  validateCustomPeriod,
};
