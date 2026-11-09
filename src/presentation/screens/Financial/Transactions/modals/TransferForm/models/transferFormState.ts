import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import TransferEntity from "@domain/entities/financial/TransferEntity";
import { CreateTransferRepositoryParams } from "@domain/repositories/financial";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  centsToDecimalString,
  decimalStringToCents,
  MAX_TRANSACTION_CENTS,
} from "@utils/money";
import { amountInFromRate, parseRate } from "@utils/transferRate";

const MAX_DESCRIPTION = 200;
const MAX_NOTES = 1000;
const MS_PER_DAY = 86_400_000;

type RateMode = "AMOUNT_IN" | "RATE";

// What the validation needs to know about the chosen accounts.
interface TransferContext {
  sameCurrency: boolean;
}

type TransferFormErrors = Partial<
  Record<
    | "amountIn"
    | "amountOut"
    | "dateIn"
    | "description"
    | "fee"
    | "fromAccountId"
    | "toAccountId",
    TranslationKeys
  >
>;

interface TransferFormState {
  amountInCents: number;
  amountOutCents: number;
  dateIn: Date;
  // The in date follows the out date until the user picks one (spec 098 FR 4).
  dateInTouched: boolean;
  dateOut: Date;
  description: string;
  feeCents: number;
  fromAccountId?: string;
  notes: string;
  paid: boolean;
  rateMode: RateMode;
  // The typed exchange rate, "1 <currency in> = rate <currency out>".
  rateText: string;
  repeatEnd?: Date;
  repeatFrequency: RecurrenceFrequency;
  repeatOn: boolean;
  toAccountId?: string;
}

function changeDateIn(state: TransferFormState, date: Date): TransferFormState {
  return { ...state, dateIn: startOfDay(date), dateInTouched: true };
}

function changeDateOut(
  state: TransferFormState,
  date: Date,
): TransferFormState {
  const dateOut = startOfDay(date);
  // Until the user picks the in date, it is the out date; a later out date always drags it along.
  const dateIn =
    state.dateInTouched && state.dateIn >= dateOut ? state.dateIn : dateOut;

  return { ...state, dateIn, dateOut };
}

function createInitialState(
  today: Date,
  defaults: { fromAccountId?: string } = {},
): TransferFormState {
  const day = startOfDay(today);

  return {
    amountInCents: 0,
    amountOutCents: 0,
    dateIn: day,
    dateInTouched: false,
    dateOut: day,
    description: "",
    feeCents: 0,
    fromAccountId: defaults.fromAccountId,
    notes: "",
    paid: true,
    rateMode: "AMOUNT_IN",
    rateText: "",
    repeatFrequency: "MONTHLY",
    repeatOn: false,
    toAccountId: undefined,
  };
}

// Whole days the money arrives after it left (0 = the same day).
function daysLater(state: TransferFormState) {
  return Math.round(
    (Date.UTC(
      state.dateIn.getFullYear(),
      state.dateIn.getMonth(),
      state.dateIn.getDate(),
    ) -
      Date.UTC(
        state.dateOut.getFullYear(),
        state.dateOut.getMonth(),
        state.dateOut.getDate(),
      )) /
      MS_PER_DAY,
  );
}

// The amount that arrives: the same as the amount out for one currency, else the typed amount or the one the rate gives.
function effectiveAmountInCents(
  state: TransferFormState,
  ctx: TransferContext,
) {
  if (ctx.sameCurrency) {
    return state.amountOutCents;
  }

  return state.rateMode === "RATE"
    ? amountInFromRate(state.amountOutCents, parseRate(state.rateText))
    : state.amountInCents;
}

function isSameState(a: TransferFormState, b: TransferFormState) {
  return (
    JSON.stringify({
      ...a,
      dateIn: a.dateIn.getTime(),
      dateOut: a.dateOut.getTime(),
      repeatEnd: a.repeatEnd?.getTime(),
    }) ===
    JSON.stringify({
      ...b,
      dateIn: b.dateIn.getTime(),
      dateOut: b.dateOut.getTime(),
      repeatEnd: b.repeatEnd?.getTime(),
    })
  );
}

function isValid(errors: TransferFormErrors) {
  return Object.keys(errors).length === 0;
}

function resetDateIn(state: TransferFormState): TransferFormState {
  return { ...state, dateIn: state.dateOut, dateInTouched: false };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Editing: the stored transfer, with its two dates and the fee as typed.
function stateFromTransfer(transfer: TransferEntity): TransferFormState {
  const dateOut = startOfDay(new Date(transfer.dateOut));
  const dateIn = startOfDay(new Date(transfer.dateIn));

  return {
    amountInCents: transfer.amountIn
      ? decimalStringToCents(transfer.amountIn)
      : 0,
    amountOutCents: decimalStringToCents(transfer.amountOut),
    dateIn,
    dateInTouched: dateIn.getTime() !== dateOut.getTime(),
    dateOut,
    description: transfer.description,
    feeCents: transfer.fee ? decimalStringToCents(transfer.fee) : 0,
    fromAccountId: transfer.fromAccountId,
    notes: transfer.notes ?? "",
    paid: transfer.paid,
    rateMode: "AMOUNT_IN",
    rateText: "",
    repeatFrequency: "MONTHLY",
    repeatOn: false,
    toAccountId: transfer.toAccountId,
  };
}

// Origin and destination trade places, amounts included (the typed rate no longer applies).
function swapAccounts(state: TransferFormState): TransferFormState {
  return {
    ...state,
    amountInCents: state.amountOutCents,
    amountOutCents: state.amountInCents,
    fromAccountId: state.toAccountId,
    rateMode: "AMOUNT_IN",
    rateText: "",
    toAccountId: state.fromAccountId,
  };
}

function toCreateParams(
  state: TransferFormState,
  ctx: TransferContext,
): CreateTransferRepositoryParams {
  const amountIn = ctx.sameCurrency ? 0 : effectiveAmountInCents(state, ctx);

  return {
    amountIn: amountIn > 0 ? centsToDecimalString(amountIn) : undefined,
    amountOut: centsToDecimalString(state.amountOutCents),
    dateIn: state.dateIn.toISOString(),
    dateOut: state.dateOut.toISOString(),
    description: state.description.trim(),
    fee: state.feeCents > 0 ? centsToDecimalString(state.feeCents) : undefined,
    fromAccountId: state.fromAccountId as string,
    notes: state.notes.trim() === "" ? undefined : state.notes.trim(),
    paid: state.paid,
    recurrence: state.repeatOn
      ? {
          endDate: state.repeatEnd?.toISOString(),
          frequency: state.repeatFrequency,
        }
      : undefined,
    toAccountId: state.toAccountId as string,
  };
}

// Only what changed: the API keeps every absent field.
function toUpdateParams(
  state: TransferFormState,
  initial: TransferFormState,
  ctx: TransferContext,
) {
  const patch: Record<string, unknown> = {};
  const amountIn = effectiveAmountInCents(state, ctx);

  if (state.description.trim() !== initial.description.trim()) {
    patch.description = state.description.trim();
  }
  if (state.notes.trim() !== initial.notes.trim()) {
    patch.notes = state.notes.trim() === "" ? null : state.notes.trim();
  }
  if (state.fromAccountId !== initial.fromAccountId) {
    patch.fromAccountId = state.fromAccountId;
  }
  if (state.toAccountId !== initial.toAccountId) {
    patch.toAccountId = state.toAccountId;
  }
  if (state.amountOutCents !== initial.amountOutCents) {
    patch.amountOut = centsToDecimalString(state.amountOutCents);
  }
  if (!ctx.sameCurrency && amountIn > 0 && amountIn !== initial.amountInCents) {
    patch.amountIn = centsToDecimalString(amountIn);
  }
  if (state.dateOut.getTime() !== initial.dateOut.getTime()) {
    patch.dateOut = state.dateOut.toISOString();
  }
  if (state.dateIn.getTime() !== initial.dateIn.getTime()) {
    patch.dateIn = state.dateIn.toISOString();
  }
  if (state.feeCents !== initial.feeCents) {
    patch.fee =
      state.feeCents > 0 ? centsToDecimalString(state.feeCents) : null;
  }
  if (state.paid !== initial.paid) {
    patch.paid = state.paid;
  }

  return patch;
}

function validate(
  state: TransferFormState,
  ctx: TransferContext,
): TransferFormErrors {
  const errors: TransferFormErrors = {};
  const description = state.description.trim();

  if (description.length === 0 || description.length > MAX_DESCRIPTION) {
    errors.description = "financial.transfers.form.errors.description";
  }
  if (!state.fromAccountId) {
    errors.fromAccountId = "financial.transfers.form.errors.accountRequired";
  }
  if (!state.toAccountId) {
    errors.toAccountId = "financial.transfers.form.errors.accountRequired";
  } else if (state.toAccountId === state.fromAccountId) {
    errors.toAccountId = "financial.errors.transferSameAccount";
  }
  if (
    state.amountOutCents <= 0 ||
    state.amountOutCents > MAX_TRANSACTION_CENTS
  ) {
    errors.amountOut = "financial.transfers.form.errors.amount";
  }
  // The amount in is only needed to pay a transfer between currencies (a series occurrence may wait for it).
  if (
    !ctx.sameCurrency &&
    state.paid &&
    effectiveAmountInCents(state, ctx) <= 0
  ) {
    errors.amountIn = "financial.transfers.form.errors.amountIn";
  }
  if (state.dateIn < state.dateOut) {
    errors.dateIn = "financial.errors.transferDateInBeforeOut";
  }
  if (state.feeCents > MAX_TRANSACTION_CENTS) {
    errors.fee = "financial.transfers.form.errors.amount";
  }

  return errors;
}

export {
  changeDateIn,
  changeDateOut,
  createInitialState,
  daysLater,
  effectiveAmountInCents,
  isSameState,
  isValid,
  MAX_DESCRIPTION,
  MAX_NOTES,
  resetDateIn,
  stateFromTransfer,
  swapAccounts,
  toCreateParams,
  toUpdateParams,
  validate,
};
export type {
  RateMode,
  TransferContext,
  TransferFormErrors,
  TransferFormState,
};
