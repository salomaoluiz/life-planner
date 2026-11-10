import {
  formatAmount,
  numberLocale,
} from "@components/AmountText/formatAmount";
import { CurrencyCode } from "@domain/entities/financial/Currency";

const MINUS = "−";

// `YYYY-MM-DD` -> "01/11/2026" (pt-BR) or "11/01/2026" (en-US), without any timezone shift.
function formatDay(day: string, localeTag: string): string {
  const [year, month, date] = day.split("-").map(Number);

  return new Intl.DateTimeFormat(numberLocale(localeTag), {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, date)));
}

function formatMoney(cents: number, currency: CurrencyCode, localeTag: string) {
  return formatAmount(cents, localeTag, currency);
}

// "+7,21%" / "−2,39%"; the sign is always written (a result is read at a glance).
function formatPercent(fraction: number, localeTag: string): string {
  const text = new Intl.NumberFormat(numberLocale(localeTag), {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "percent",
  }).format(Math.abs(fraction));

  return `${signOf(fraction)}${text}`;
}

// Decimal text ("18.3572") in the locale: "18,3572" / "1.200".
function formatQuantity(quantity: string, localeTag: string): string {
  return new Intl.NumberFormat(numberLocale(localeTag), {
    maximumFractionDigits: 8,
  }).format(Number(quantity));
}

// "+R$ 849,60" / "−R$ 228,00" / "R$ 0,00": a result always carries its sign.
function formatResult(
  cents: number,
  currency: CurrencyCode,
  localeTag: string,
): string {
  return `${signOf(cents)}${formatAmount(Math.abs(cents), localeTag, currency)}`;
}

// "13:05" in the device time zone (the quote time the user sees).
function formatTime(iso: string, localeTag: string): string {
  return new Intl.DateTimeFormat(numberLocale(localeTag), {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
  }).format(new Date(iso));
}

// A price per unit keeps its decimals: "R$ 10,53", "US$ 114,6345".
function formatUnitPrice(
  price: string,
  currency: CurrencyCode,
  localeTag: string,
  fractionDigits?: number,
): string {
  return new Intl.NumberFormat(numberLocale(localeTag), {
    currency,
    maximumFractionDigits: fractionDigits ?? 8,
    minimumFractionDigits: fractionDigits ?? 2,
    style: "currency",
  })
    .format(Number(price))
    .replace(/\s/g, " ");
}

function resultTone(cents: null | number): "expense" | "income" | "secondary" {
  if (cents === null || cents === 0) {
    return "secondary";
  }

  return cents > 0 ? "income" : "expense";
}

function signOf(value: number): string {
  if (value === 0) {
    return "";
  }

  return value > 0 ? "+" : MINUS;
}

export {
  formatDay,
  formatMoney,
  formatPercent,
  formatQuantity,
  formatResult,
  formatTime,
  formatUnitPrice,
  resultTone,
};
