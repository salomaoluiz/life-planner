// Supported ISO 4217 codes (spec 040): mirrors the backend list. The app language never decides the currency.
export const SUPPORTED_CURRENCIES = ["BRL", "USD", "EUR"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "BRL";

// Older API responses carry no currency: anything unknown reads as the default.
export function toCurrencyCode(value: unknown): CurrencyCode {
  return (
    SUPPORTED_CURRENCIES.find((code) => code === value) ?? DEFAULT_CURRENCY
  );
}
