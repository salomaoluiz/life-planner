import {
  InvestmentOperationType,
  isInvestmentEvent,
} from "@domain/entities/investment/enums";
import {
  InvestmentEventSuggestion,
  InvestmentOperation,
} from "@domain/entities/investment/InvestmentEntities";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatDecimal, parseDecimal, ZERO } from "@utils/decimal";

export interface EventHeadline {
  key: TranslationKeys;
  params: Record<string, string>;
}

interface EventLike {
  bonusPercent?: string;
  ratioFrom?: string;
  ratioTo?: string;
  type: InvestmentOperationType;
}

// Shares added by the event (after − before) as a decimal string; "0" when the position shrinks or stays.
export function addedShares(before: string, after: string): string {
  const diff = (parseDecimal(after) ?? ZERO) - (parseDecimal(before) ?? ZERO);

  return diff > ZERO ? formatDecimal(diff) : "0";
}

// "1 new for every N" (spec 108 copy table): N = 100 / percent, without trailing zeros.
export function bonusEvery(percent: string): string {
  const parsed = Number(percent);

  return parsed > 0 ? String(Number((100 / parsed).toFixed(2))) : "";
}

// The card title: "Bonificação · 10%", "Desdobramento · 1 para 4".
export function eventHeadline(
  event: EventLike,
  typeLabel: string,
): EventHeadline {
  if (event.type === InvestmentOperationType.BONUS) {
    return {
      key: "investment.event.bonusHeadline",
      params: { percent: event.bonusPercent ?? "", type: typeLabel },
    };
  }

  return {
    key: "investment.event.ratioHeadline",
    params: {
      from: event.ratioFrom ?? "",
      to: event.ratioTo ?? "",
      type: typeLabel,
    },
  };
}

// The suggestion that heads the banner: the oldest data-com first (it is the one the quote reflects the longest).
export function firstSuggestion(
  suggestions: InvestmentEventSuggestion[],
): InvestmentEventSuggestion | undefined {
  return [...suggestions].sort((a, b) => a.date.localeCompare(b.date))[0];
}

// Spec 108 section 8: the hint "the record date has passed" shows when the asset has sells dated after the data-com.
export function hasSellsAfter(
  operations: InvestmentOperation[],
  date: string,
): boolean {
  return operations.some(
    (operation) =>
      operation.type === InvestmentOperationType.SELL &&
      operation.fractionOfOperationId === undefined &&
      operation.date > date,
  );
}

export function isEventOperation(operation: InvestmentOperation): boolean {
  return isInvestmentEvent(operation.type);
}

export function isFractionSale(operation: InvestmentOperation): boolean {
  return operation.fractionOfOperationId !== undefined;
}

// The fraction of an event still to sell, from the position (undefined once it was sold).
export function pendingFractionOf<T extends { eventId: string }>(
  pending: T[],
  eventId: string,
): T | undefined {
  return pending.find((fraction) => fraction.eventId === eventId);
}

// The sum of the pending fractions as a decimal string ("0.5").
export function pendingFractionTotal(pending: { quantity: string }[]): string {
  return formatDecimal(
    pending.reduce(
      (sum, item) => sum + (parseDecimal(item.quantity) ?? ZERO),
      ZERO,
    ),
  );
}

// after − before as a signed decimal string ("-2840", "31"): the quantity column of an event row.
export function quantityDelta(before: string, after: string): string {
  return formatDecimal(
    (parseDecimal(after) ?? ZERO) - (parseDecimal(before) ?? ZERO),
  );
}
