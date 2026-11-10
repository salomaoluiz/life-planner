import { InvestmentPriceSource } from "@domain/entities/investment/enums";
import {
  InvestmentAsset,
  InvestmentQuote,
} from "@domain/entities/investment/InvestmentEntities";

// Spec 104 FR 21: how the "Updated" cell reads. The View turns it into text; nothing here translates.
export type UpdatedInfo =
  | { date: string; kind: "date"; warning: boolean }
  | { date: string; kind: "manual"; warning: boolean }
  | { kind: "none"; warning: false }
  | { kind: "time"; time: string; warning: boolean }
  | { kind: "yesterday"; time: string; warning: boolean };

export function hasQuotedAssets(assets: InvestmentAsset[]): boolean {
  return assets.some((asset) => asset.quote !== null);
}

// The "no quote" badge: the ticker stopped being quoted (5 business days without a price).
export function isQuoteUnavailable(asset: InvestmentAsset): boolean {
  return asset.quote?.unavailable === true;
}

// The most recent quote time of the listed assets, for "Quotes from 13:00".
export function latestQuoteTime(assets: InvestmentAsset[]): null | string {
  const times = assets
    .map((asset) => asset.quote?.quotedAt)
    .filter((value): value is string => !!value)
    .sort();

  return times.length > 0 ? times[times.length - 1] : null;
}

// A fraction ("0.48" percent from the API -> 0.0048); null without a quote or a change.
export function todayChange(asset: InvestmentAsset): null | number {
  const raw = asset.quote?.changePercent;

  if (
    raw === null ||
    raw === undefined ||
    asset.priceSource !== InvestmentPriceSource.QUOTE
  ) {
    return null;
  }

  const percent = Number(raw);

  return Number.isFinite(percent) ? percent / 100 : null;
}

// `now` and `timeOf` are injected so the rule is testable without a clock or a locale.
export function updatedInfo(
  asset: InvestmentAsset,
  now: Date,
  timeOf: (iso: string) => string,
): UpdatedInfo {
  const { position, quote } = asset;

  if (
    asset.priceSource === InvestmentPriceSource.MANUAL &&
    position.currentValueDate
  ) {
    return {
      date: position.currentValueDate,
      kind: "manual",
      // A manual value over a ticker that is quoted (or was) is the warning case of the artboard.
      warning: quote !== null,
    };
  }
  if (!quote || asset.priceSource !== InvestmentPriceSource.QUOTE) {
    return { kind: "none", warning: false };
  }

  return quoteUpdated(quote, now, timeOf);
}

function quoteUpdated(
  quote: InvestmentQuote,
  now: Date,
  timeOf: (iso: string) => string,
): UpdatedInfo {
  const quoted = new Date(quote.quotedAt);
  const days = Math.floor(
    (startOfDay(now).getTime() - startOfDay(quoted).getTime()) / 86_400_000,
  );
  const time = timeOf(quote.quotedAt);

  if (days <= 0) {
    return { kind: "time", time, warning: quote.stale };
  }
  if (days === 1) {
    return { kind: "yesterday", time, warning: quote.stale };
  }

  return { date: quote.quotedAt.slice(0, 10), kind: "date", warning: true };
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}
