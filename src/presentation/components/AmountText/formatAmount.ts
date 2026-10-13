const MINUS = "−";
const MAX_DIGITS = 12;

export type AmountType = "EXPENSE" | "INCOME";

export function formatAmount(
  cents: number,
  localeTag: string,
  type?: AmountType,
): string {
  const { currency, locale } = getCurrencyConfig(localeTag);
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

export function getCurrencyConfig(localeTag: string) {
  return localeTag.toLowerCase().startsWith("pt")
    ? ({ currency: "BRL", locale: "pt-BR" } as const)
    : ({ currency: "USD", locale: "en-US" } as const);
}

export function parseCents(text: string): number {
  const digits = text.replace(/\D/g, "").slice(0, MAX_DIGITS);

  return digits ? Number(digits) : 0;
}
