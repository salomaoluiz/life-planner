import { numberLocale } from "@components/AmountText/formatAmount";
import type { CurrencyCode } from "@domain/entities/financial/Currency";
import { DashboardCurrencyOption } from "@domain/entities/financial/DashboardEntity";

export interface Delta {
  text: string;
  tone: "bad" | "good" | "neutral";
}

const SUPPORTED_ORDER = ["BRL", "USD", "EUR"];

// Most accounts wins; a tie goes to the first in the supported order (spec 046 FR 3).
function defaultCurrency(options: DashboardCurrencyOption[]): string {
  const sorted = [...options].sort(
    (a, b) =>
      b.accounts - a.accounts ||
      SUPPORTED_ORDER.indexOf(a.code) - SUPPORTED_ORDER.indexOf(b.code),
  );

  return sorted[0]?.code ?? "BRL";
}

// "▲ 8,4%" / "▼ 19,2%" against the previous period; no previous data → "—" without colour.
function deltaOf(
  current: number,
  previous: number | undefined,
  direction: "upIsBad" | "upIsGood",
  localeTag: string,
): Delta {
  if (!previous) {
    return { text: "—", tone: "neutral" };
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;

  if (change === 0) {
    return { text: "0%", tone: "neutral" };
  }

  const up = change > 0;
  const percent = new Intl.NumberFormat(numberLocale(localeTag), {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(Math.abs(change));
  const good = direction === "upIsGood" ? up : !up;

  return {
    text: `${up ? "▲" : "▼"} ${percent}%`,
    tone: good ? "good" : "bad",
  };
}

// Axis label of a bucket: the month ("nov"), the week start ("3 nov") or the day ("3").
function formatBucketLabel(
  start: string,
  granularity: "DAY" | "MONTH" | "WEEK",
  localeTag: string,
): string {
  const [year, month, day] = start.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const locale = numberLocale(localeTag);

  if (granularity === "MONTH") {
    return new Intl.DateTimeFormat(locale, { month: "short" })
      .format(date)
      .replace(".", "");
  }

  return new Intl.DateTimeFormat(
    locale,
    granularity === "DAY"
      ? { day: "numeric" }
      : { day: "numeric", month: "short" },
  )
    .format(date)
    .replace(".", "");
}

// "3 nov 2025": the long form used in the detail panel and in the accessibility summaries.
function formatDay(key: string, localeTag: string): string {
  const [year, month, day] = key.split("-").map(Number);

  return new Intl.DateTimeFormat(numberLocale(localeTag), {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(new Date(year, month - 1, day))
    .replace(/\./g, "");
}

// Axis label: "R$ 12 mil" (wide) or "12k" (narrow); small values keep the plain amount.
function formatTick(
  cents: number,
  localeTag: string,
  currency: CurrencyCode,
  compact: boolean,
): string {
  const locale = numberLocale(localeTag);
  const value = cents / 100;
  const absolute = Math.abs(value);
  const symbol =
    new Intl.NumberFormat(locale, { currency, style: "currency" })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency;
  const suffix = locale === "pt-BR" ? " mil" : "k";

  if (absolute >= 1000) {
    const thousands = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 1,
    }).format(value / 1000);

    return compact ? `${thousands}k` : `${symbol} ${thousands}${suffix}`;
  }

  const plain = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);

  return compact ? plain : `${symbol} ${plain}`;
}

function keepOrDefault(
  current: string | undefined,
  options: DashboardCurrencyOption[],
): string {
  return current && options.some((option) => option.code === current)
    ? current
    : defaultCurrency(options);
}

// Share of a total as "18%"; an empty total gives "0%".
function percentOf(part: number, total: number, localeTag: string): string {
  const share = total > 0 ? (part / total) * 100 : 0;

  return `${new Intl.NumberFormat(numberLocale(localeTag), {
    maximumFractionDigits: 0,
  }).format(share)}%`;
}

export {
  defaultCurrency,
  deltaOf,
  formatBucketLabel,
  formatDay,
  formatTick,
  keepOrDefault,
  percentOf,
};
