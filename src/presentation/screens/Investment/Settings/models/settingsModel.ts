import { numberLocale } from "@components/AmountText/formatAmount";
import { InvestmentMarketIndexes } from "@domain/entities/investment/InvestmentEntities";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatDay } from "@screens/Investment/models/format";

const DASH = "—";

interface StaleNotice {
  date: string;
  index: string;
  value: string;
  valueDate: string;
}

function followersText(count: number): string {
  return count > 0 ? String(count) : DASH;
}

// Before the first run of the job no index is stored (spec 113 FR 17).
function isEmptyIndexes(indexes: InvestmentMarketIndexes): boolean {
  return !indexes.cdi && !indexes.selic && !indexes.ipca;
}

function localDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

// "2026-10" -> "out. de 2026" / "Oct 2026".
function monthLabel(month: string, localeTag: string): string {
  const [year, number] = month.split("-").map(Number);

  return new Intl.DateTimeFormat(numberLocale(localeTag), {
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, number - 1, 1)));
}

// "0.055131" -> "0,055131" (pt-BR): fixed places, a dash for no value.
function percentLabel(
  value: null | string | undefined,
  places: number,
  localeTag: string,
): string {
  if (value === null || value === undefined) {
    return DASH;
  }

  return new Intl.NumberFormat(numberLocale(localeTag), {
    maximumFractionDigits: places,
    minimumFractionDigits: places,
  }).format(Number(value));
}

// FR 25: the first stale index with the day the Central Bank was last reached and the last value kept.
function staleNotice(
  indexes: InvestmentMarketIndexes,
  localeTag: string,
): null | StaleNotice {
  const date = indexes.lastSuccessAt
    ? formatDay(localDay(new Date(indexes.lastSuccessAt)), localeTag)
    : DASH;

  if (indexes.cdi?.stale) {
    return {
      date,
      index: "CDI",
      value: percentLabel(indexes.cdi.annual, 2, localeTag),
      valueDate: formatDay(indexes.cdi.date, localeTag),
    };
  }
  if (indexes.selic?.stale) {
    return {
      date,
      index: "Selic",
      value: percentLabel(indexes.selic.target, 2, localeTag),
      valueDate: formatDay(indexes.selic.date, localeTag),
    };
  }
  if (indexes.ipca?.stale) {
    const month = indexes.ipca.month ?? "";

    return {
      date,
      index: "IPCA",
      value: percentLabel(indexes.ipca.accumulated12m, 2, localeTag),
      valueDate: month ? month.split("-").reverse().join("/") : DASH,
    };
  }

  return null;
}

// "Updated today at 19:05" / "yesterday at 19:05" / "on 02/11/2026 at 19:05".
function updatedWhen(
  lastSuccessAt: null | string,
  now: Date,
  localeTag: string,
): { key: TranslationKeys; params: Record<string, string> } {
  if (!lastSuccessAt) {
    return { key: "investment.settings.never", params: {} };
  }

  const at = new Date(lastSuccessAt);
  const time = new Intl.DateTimeFormat(numberLocale(localeTag), {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  }).format(at);
  const today = localDay(now);
  const yesterday = localDay(new Date(now.getTime() - 86_400_000));
  const day = localDay(at);

  if (day === today) {
    return { key: "investment.settings.when.today", params: { time } };
  }
  if (day === yesterday) {
    return { key: "investment.settings.when.yesterday", params: { time } };
  }

  return {
    key: "investment.settings.when.date",
    params: { date: formatDay(day, localeTag), time },
  };
}

export type { StaleNotice };
export {
  followersText,
  isEmptyIndexes,
  monthLabel,
  percentLabel,
  staleNotice,
  updatedWhen,
};
