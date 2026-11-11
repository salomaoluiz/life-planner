import { todayCalendarDate } from "@data/models/financial/calendarDate";
import {
  InvestmentOperationType,
  isInvestmentEvent,
} from "@domain/entities/investment/enums";
import {
  InvestmentEventSuggestion,
  InvestmentOperation,
} from "@domain/entities/investment/InvestmentEntities";
import {
  ApproveInvestmentEventSuggestionParams,
  CreateInvestmentEventParams,
  UpdateInvestmentOperationParams,
} from "@domain/repositories/investment";
import { TranslationKeys } from "@presentation/i18n/types";
import { parseDecimal, ZERO } from "@utils/decimal";

const MAX_RATIO = BigInt(1000000) * BigInt(10) ** BigInt(8);
const MAX_BONUS_PERCENT = BigInt(1000) * BigInt(10) ** BigInt(8);

// The "Evento" option of the type segment (a view-only value next to BUY and SELL).
export const EVENT_SEGMENT = "EVENT";

// Spec 108 FR 4-5: what the owner types for a split, a reverse split or a bonus.
export interface EventDraft {
  bonusPercent: string;
  bonusUnitCost: string;
  // The data-com.
  date: Date;
  ratioFrom: string;
  ratioTo: string;
  type: InvestmentOperationType;
}

export interface EventErrors {
  bonusPercent?: TranslationKeys;
  bonusUnitCost?: TranslationKeys;
  ratioFrom?: TranslationKeys;
  ratioTo?: TranslationKeys;
}

interface EventFields {
  bonusPercent?: string;
  bonusUnitCost?: string;
  ratioFrom?: string;
  ratioTo?: string;
}

export function defaultDraft(): EventDraft {
  return {
    bonusPercent: "",
    bonusUnitCost: "",
    date: new Date(),
    ratioFrom: "",
    ratioTo: "",
    type: InvestmentOperationType.SPLIT,
  };
}

export function draftFromOperation(operation: InvestmentOperation): EventDraft {
  const event = operation.corporateEvent;

  return {
    bonusPercent: event?.bonusPercent ?? "",
    bonusUnitCost: event?.bonusUnitCost ?? "",
    date: dayToDate(operation.date),
    ratioFrom: event?.ratioFrom ?? "",
    ratioTo: event?.ratioTo ?? "",
    type: isInvestmentEvent(operation.type)
      ? operation.type
      : InvestmentOperationType.SPLIT,
  };
}

export function draftFromSuggestion(
  suggestion: InvestmentEventSuggestion,
): EventDraft {
  return {
    bonusPercent: suggestion.bonusPercent ?? "",
    bonusUnitCost: suggestion.bonusUnitCost ?? "",
    date: dayToDate(suggestion.date),
    ratioFrom: suggestion.ratioFrom ?? "",
    ratioTo: suggestion.ratioTo ?? "",
    type: suggestion.type,
  };
}

export function hasEventErrors(errors: EventErrors): boolean {
  return Object.values(errors).some((error) => error !== undefined);
}

export function isSameDraft(a: EventDraft, b: EventDraft): boolean {
  return (
    a.type === b.type &&
    todayCalendarDate(a.date) === todayCalendarDate(b.date) &&
    a.ratioFrom === b.ratioFrom &&
    a.ratioTo === b.ratioTo &&
    a.bonusPercent === b.bonusPercent &&
    a.bonusUnitCost === b.bonusUnitCost
  );
}

export function nonEmpty(value?: string): string | undefined {
  const text = value?.trim();

  if (!text) {
    return undefined;
  }

  return text;
}

// Approving with the values on screen (the edit path of FR 29).
export function toApproveParams(
  id: string,
  draft: EventDraft,
): ApproveInvestmentEventSuggestionParams {
  const fields = fieldsOf(draft);

  return {
    ...fields,
    date: todayCalendarDate(draft.date),
    id,
    type: draft.type,
  };
}

export function toCreateParams(
  assetId: string,
  draft: EventDraft,
): CreateInvestmentEventParams {
  const fields = fieldsOf(draft);

  return {
    assetId,
    ...fields,
    bonusUnitCost: nonEmpty(fields.bonusUnitCost),
    date: todayCalendarDate(draft.date),
    type: draft.type,
  };
}

// An edit keeps the type (FR 7): the date and the fields of that type; an emptied cost per share clears it.
export function toUpdateParams(
  id: string,
  draft: EventDraft,
): UpdateInvestmentOperationParams {
  const fields = fieldsOf(draft);

  return {
    ...fields,
    bonusUnitCost:
      draft.type === InvestmentOperationType.BONUS
        ? (nonEmpty(fields.bonusUnitCost) ?? null)
        : undefined,
    date: todayCalendarDate(draft.date),
    id,
  };
}

// FR 4-5: SPLIT needs `to > from`, REVERSE_SPLIT `to < from`, BONUS a percent up to 1.000; the cost per new share is
// optional (empty = zero).
export function validateDraft(draft: EventDraft): EventErrors {
  if (draft.type === InvestmentOperationType.BONUS) {
    const percent = parseDecimal(draft.bonusPercent);
    const cost =
      draft.bonusUnitCost.trim() === ""
        ? ZERO
        : parseDecimal(draft.bonusUnitCost);

    return {
      bonusPercent:
        percent === null || percent <= ZERO || percent > MAX_BONUS_PERCENT
          ? "investment.event.errors.percent"
          : undefined,
      bonusUnitCost:
        cost === null ? "investment.event.errors.unitCost" : undefined,
    };
  }

  const from = ratioError(draft.ratioFrom);
  const to = ratioError(draft.ratioTo);
  const errors: EventErrors = { ratioFrom: from.error, ratioTo: to.error };

  if (from.value !== undefined && to.value !== undefined) {
    if (
      draft.type === InvestmentOperationType.SPLIT &&
      to.value <= from.value
    ) {
      errors.ratioTo = "investment.event.errors.splitDirection";
    }
    if (
      draft.type === InvestmentOperationType.REVERSE_SPLIT &&
      to.value >= from.value
    ) {
      errors.ratioTo = "investment.event.errors.reverseDirection";
    }
  }

  return errors;
}

function dayToDate(day: string): Date {
  const [year, month, date] = day.split("-").map(Number);

  return new Date(year, month - 1, date);
}

function fieldsOf(draft: EventDraft): EventFields {
  return draft.type === InvestmentOperationType.BONUS
    ? { bonusPercent: draft.bonusPercent, bonusUnitCost: draft.bonusUnitCost }
    : { ratioFrom: draft.ratioFrom, ratioTo: draft.ratioTo };
}

function ratioError(text: string): { error?: TranslationKeys; value?: bigint } {
  const value = parseDecimal(text);

  if (value === null || value <= ZERO || value > MAX_RATIO) {
    return { error: "investment.event.errors.ratio" };
  }

  return { value };
}
