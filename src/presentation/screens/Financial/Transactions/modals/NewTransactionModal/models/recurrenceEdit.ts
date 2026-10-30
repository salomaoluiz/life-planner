import { MaterializeOccurrenceUseCaseParams } from "@application/useCases/cases/financial/recurrences/materializeOccurrenceUseCase";
import { SplitRecurrenceUseCaseParams } from "@application/useCases/cases/financial/recurrences/splitRecurrenceUseCase";
import { UpdateRecurrenceUseCaseParams } from "@application/useCases/cases/financial/recurrences/updateRecurrenceUseCase";
import { UpdateTransactionUseCaseParams } from "@application/useCases/cases/financial/transactions/updateTransactionUseCase";
import { RecurrenceScope } from "@domain/entities/financial/RecurrenceEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import { centsToDecimalString } from "@utils/money";

import { TransactionFormState } from "./transactionFormState";

// Which controls a scope makes read-only (spec 034 FR 20).
interface RecurrenceLocks {
  account: boolean;
  date: boolean;
  endDate: boolean;
  frequency: boolean;
  paid: boolean;
}

interface RecurringContext {
  isCard: boolean;
  isProjected: boolean;
  occurrenceNumber: number;
  recurrenceId: string;
  // The stored transaction when the occurrence is real.
  transactionId?: string;
}

// What saving does for the chosen scope; `none` = nothing changed.
type RecurringSave =
  | { kind: "materialize"; params: MaterializeOccurrenceUseCaseParams }
  | { kind: "none" }
  | { kind: "split"; params: SplitRecurrenceUseCaseParams }
  | { kind: "update-series"; params: UpdateRecurrenceUseCaseParams }
  | { kind: "update-transaction"; params: UpdateTransactionUseCaseParams };

// Only the fields the user changed are sent: a customised value of another occurrence must not be reset.
function buildRecurringSave(
  scope: RecurrenceScope,
  state: TransactionFormState,
  initial: TransactionFormState,
  context: RecurringContext,
): RecurringSave {
  const locks = recurrenceLocks(scope);
  const common = {
    categoryId:
      state.categoryId !== initial.categoryId ? state.categoryId : undefined,
    description:
      state.description.trim() !== initial.description.trim()
        ? state.description.trim()
        : undefined,
    // `null` clears the notes (spec 059).
    notes:
      state.notes.trim() !== initial.notes.trim()
        ? state.notes.trim() || null
        : undefined,
    // The whole list travels when it changed (`[]` removes every tag).
    tags: isSameTags(state.tags, initial.tags) ? undefined : state.tags,
    value:
      state.amountCents !== initial.amountCents
        ? centsToDecimalString(state.amountCents)
        : undefined,
  };
  const endChanged =
    state.repeatEnd?.getTime() !== initial.repeatEnd?.getTime();
  // `null` removes the end date.
  const endDate = endChanged
    ? (state.repeatEnd?.toISOString() ?? null)
    : undefined;

  if (scope === "ONLY_THIS") {
    return onlyThis(state, initial, context, common);
  }

  if (scope === "ALL") {
    const changes = { ...common, endDate: locks.endDate ? undefined : endDate };

    return hasChanges(changes)
      ? {
          kind: "update-series",
          params: { ...changes, id: context.recurrenceId },
        }
      : none();
  }

  const changes = {
    ...common,
    accountId:
      !context.isCard && state.accountId !== initial.accountId
        ? state.accountId
        : undefined,
    creditCardId:
      context.isCard && state.creditCardId !== initial.creditCardId
        ? state.creditCardId
        : undefined,
    endDate,
    frequency:
      state.repeatFrequency !== initial.repeatFrequency
        ? state.repeatFrequency
        : undefined,
  };

  return hasChanges(changes)
    ? {
        kind: "split",
        params: {
          ...changes,
          occurrenceNumber: context.occurrenceNumber,
          recurrenceId: context.recurrenceId,
        },
      }
    : none();
}

function hasChanges(params: object) {
  return Object.values(params).some((value) => value !== undefined);
}

function isSameTags(a: string[], b: string[]) {
  return a.length === b.length && a.every((tag, index) => tag === b[index]);
}

function lockedHelperKey(locked: boolean, field: keyof RecurrenceLocks) {
  if (!locked) {
    return undefined;
  }

  // Account and frequency only change from this occurrence on; the end date in the series; date and status per row.
  const keys: Record<keyof RecurrenceLocks, TranslationKeys> = {
    account: "financial.recurrence.lockedThisAndNext",
    date: "financial.recurrence.lockedOnlyThis",
    endDate: "financial.recurrence.lockedAll",
    frequency: "financial.recurrence.lockedThisAndNext",
    paid: "financial.recurrence.lockedOnlyThis",
  };

  return keys[field];
}

function none(): RecurringSave {
  return { kind: "none" };
}

function onlyThis(
  state: TransactionFormState,
  initial: TransactionFormState,
  context: RecurringContext,
  common: {
    categoryId?: string;
    description?: string;
    notes?: null | string;
    tags?: string[];
    value?: string;
  },
): RecurringSave {
  const fields = {
    ...common,
    date:
      state.date.getTime() !== initial.date.getTime()
        ? state.date.toISOString()
        : undefined,
    // A card occurrence follows its invoice: no status.
    paid:
      !context.isCard && state.paid !== initial.paid ? state.paid : undefined,
  };

  if (!hasChanges(fields)) {
    return none();
  }

  if (context.isProjected) {
    return {
      kind: "materialize",
      params: {
        ...fields,
        occurrenceNumber: context.occurrenceNumber,
        recurrenceId: context.recurrenceId,
      },
    };
  }

  return {
    kind: "update-transaction",
    params: { ...fields, id: context.transactionId!, scope: "ONLY_THIS" },
  };
}

function recurrenceLocks(scope: RecurrenceScope): RecurrenceLocks {
  switch (scope) {
    case "ALL":
      return {
        account: true,
        date: true,
        endDate: false,
        frequency: true,
        paid: true,
      };
    case "ONLY_THIS":
      return {
        account: true,
        date: false,
        endDate: true,
        frequency: true,
        paid: false,
      };
    case "THIS_AND_NEXT":
      return {
        account: false,
        date: true,
        endDate: false,
        frequency: false,
        paid: true,
      };
  }
}

export type { RecurrenceLocks, RecurringContext, RecurringSave };
export { buildRecurringSave, lockedHelperKey, recurrenceLocks };
