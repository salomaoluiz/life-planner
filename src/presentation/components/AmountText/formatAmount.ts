import type { CurrencyCode } from "@domain/entities/financial/Currency";

const MINUS = "−";
const MAX_DIGITS = 12;

export type AmountType = "EXPENSE" | "INCOME";

export function formatAmount(
  cents: number,
  localeTag: string,
  currency: CurrencyCode,
  type?: AmountType,
): string {
  const locale = numberLocale(localeTag);
  const absolute = type ? Math.abs(cents) : cents;
  const formatted = new Intl.NumberFormat(locale, {
    currency,
    style: "currency",
  })
    .format(absolute / 100)
    .replace(/\s/g, " ");

  if (!type || cents === 0) {
    return formatted;
  }

  return `${type === "EXPENSE" ? MINUS : "+"} ${formatted}`;
}

// The language only picks the number format; the currency is data (spec 040).
export function numberLocale(localeTag: string): "en-US" | "pt-BR" {
  return localeTag.toLowerCase().startsWith("pt") ? "pt-BR" : "en-US";
}

export function parseCents(text: string): number {
  const digits = text.replace(/\D/g, "").slice(0, MAX_DIGITS);

  return digits ? Number(digits) : 0;
}
