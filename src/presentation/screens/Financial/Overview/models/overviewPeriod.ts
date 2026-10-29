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
export type OverviewPreset = "3M" | "6M" | "12M" | "CUSTOM" | "YEAR";

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

function endOfCurrentMonth(today: string): string {
  const date = parse(today);

  return toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0));
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

// Presets end on the last day of the current month (spec 046 FR 3); 12M on 2026-10-20 = 2025-11-01 → 2026-10-31.
function periodForPreset(
  preset: Exclude<OverviewPreset, "CUSTOM">,
  today: string,
): OverviewPeriod {
  const date = parse(today);
  const to = endOfCurrentMonth(today);

  if (preset === "YEAR") {
    return { from: toDateKey(new Date(date.getFullYear(), 0, 1)), to };
  }

  const months = { "3M": 3, "6M": 6, "12M": 12 }[preset];

  return {
    from: toDateKey(
      new Date(date.getFullYear(), date.getMonth() - (months - 1), 1),
    ),
    to,
  };
}

// The custom range: at most 2 years (the 045 rule) and never after the end of the current month.
function validateCustomPeriod(
  from: string,
  to: string,
  today: string,
): { maxTo: string; ok: false } | { ok: true } {
  const maxMonth = endOfCurrentMonth(today);
  const validation = validatePeriod(from, to);

  if (!validation.ok) {
    return {
      maxTo: validation.maxTo < maxMonth ? validation.maxTo : maxMonth,
      ok: false,
    };
  }

  return to <= maxMonth ? { ok: true } : { maxTo: maxMonth, ok: false };
}

export {
  defaultGranularity,
  endOfCurrentMonth,
  granularityOptions,
  monthsInPeriod,
  periodForPreset,
  validateCustomPeriod,
};
