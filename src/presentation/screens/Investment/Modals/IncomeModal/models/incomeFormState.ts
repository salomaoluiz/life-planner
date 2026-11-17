import { todayCalendarDate } from "@data/models/financial/calendarDate";
import {
  isRecurrenceFrequency,
  RecurrenceFrequency,
} from "@domain/entities/financial/RecurrenceEntity";
import {
  InvestmentIncomeStatus,
  InvestmentIncomeType,
} from "@domain/entities/investment/enums";
import {
  InvestmentIncome,
  InvestmentIncomeSuggestion,
} from "@domain/entities/investment/InvestmentEntities";
import {
  CreateInvestmentIncomeParams,
  CreateInvestmentIncomeSeriesParams,
  UpdateInvestmentIncomeParams,
} from "@domain/repositories/investment";
import { TranslationKeys } from "@presentation/i18n/types";
import { mulToCents, parseDecimal, ZERO } from "@utils/decimal";

const BASIS = 10000;
const MAX_EX_DATE_OFFSET = 90;

export interface IncomeFormErrors {
  accountId?: TranslationKeys;
  amountPerUnit?: TranslationKeys;
  categoryId?: TranslationKeys;
  endDate?: TranslationKeys;
  exDateOffset?: TranslationKeys;
  frequency?: TranslationKeys;
  netAmount?: TranslationKeys;
  quantity?: TranslationKeys;
}

export interface IncomeFormState {
  accountId: string;
  categoryId: string;
  // Spec 115: the end of a series (none = no end date).
  endDate?: Date;
  exDate?: Date;
  // Spec 115: days between the ex-date and the payment of each occurrence (text, empty = the payment date).
  exDateOffset: string;
  frequency: RecurrenceFrequency;
  // Spec 115: occurrences before today are created as received.
  markPast: boolean;
  // Cents typed by the owner; only used once `netTouched` (or when quantity × per unit cannot be computed).
  netAmount: number;
  netTouched: boolean;
  notes: string;
  paymentDate: Date;
  perUnit: string;
  quantity: string;
  // Spec 115: the income repeats (create only).
  repeat: boolean;
  status: InvestmentIncomeStatus;
  type: InvestmentIncomeType;
  // Spec 115: false = no account, no category, no finance row.
  withFinance: boolean;
}

function dayToDate(day: string): Date {
  const [year, month, date] = day.split("-").map(Number);

  return new Date(year, month - 1, date);
}

// FR 4: the net the form shows. Once the owner typed a value it stays; until then it follows quantity × per unit.
function effectiveNet(state: IncomeFormState, bps: number): number {
  if (state.netTouched) {
    return state.netAmount;
  }

  return suggestedNet(state, bps) ?? state.netAmount;
}

function estimateOf(net: number, bps: number) {
  if (bps <= 0) {
    return { gross: net, withheld: 0 };
  }

  const gross = Math.round((net * BASIS) / (BASIS - bps));

  return { gross, withheld: gross - net };
}

function hasErrors(errors: IncomeFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

function initialState(params: {
  accountId?: null | string;
  categoryId?: null | string;
  exDate?: string;
  paymentDate?: string;
  perUnit?: string;
  quantity?: string;
  type: InvestmentIncomeType;
  withFinance?: boolean;
}): IncomeFormState {
  return {
    accountId: params.accountId ?? "",
    categoryId: params.categoryId ?? "",
    endDate: undefined,
    exDate: params.exDate ? dayToDate(params.exDate) : undefined,
    exDateOffset: "",
    frequency: { interval: 1, unit: "MONTH" },
    markPast: true,
    netAmount: 0,
    netTouched: false,
    notes: "",
    paymentDate: params.paymentDate
      ? dayToDate(params.paymentDate)
      : new Date(),
    perUnit: params.perUnit ?? "",
    quantity: params.quantity ?? "",
    repeat: false,
    status: InvestmentIncomeStatus.PLANNED,
    type: params.type,
    withFinance: params.withFinance ?? true,
  };
}

function isPositiveOrEmpty(text: string): boolean {
  if (text.trim() === "") {
    return true;
  }

  const value = parseDecimal(text);

  return value !== null && value > ZERO;
}

function isSameState(a: IncomeFormState, b: IncomeFormState): boolean {
  return (
    a.accountId === b.accountId &&
    a.categoryId === b.categoryId &&
    a.netAmount === b.netAmount &&
    a.notes === b.notes &&
    a.exDateOffset === b.exDateOffset &&
    a.frequency.interval === b.frequency.interval &&
    a.frequency.unit === b.frequency.unit &&
    a.markPast === b.markPast &&
    a.perUnit === b.perUnit &&
    a.quantity === b.quantity &&
    a.repeat === b.repeat &&
    a.status === b.status &&
    a.type === b.type &&
    a.withFinance === b.withFinance &&
    (a.endDate ? todayCalendarDate(a.endDate) : "") ===
      (b.endDate ? todayCalendarDate(b.endDate) : "") &&
    todayCalendarDate(a.paymentDate) === todayCalendarDate(b.paymentDate) &&
    (a.exDate ? todayCalendarDate(a.exDate) : "") ===
      (b.exDate ? todayCalendarDate(b.exDate) : "")
  );
}

function stateFromIncome(income: InvestmentIncome): IncomeFormState {
  return {
    ...initialState({
      accountId: income.accountId,
      categoryId: income.categoryId,
      exDate: income.exDate,
      paymentDate: income.paymentDate,
      perUnit: income.amountPerUnit,
      quantity: income.quantity,
      type: income.type,
      withFinance: income.withFinance,
    }),
    netAmount: income.netAmount,
    netTouched: true,
    notes: income.notes ?? "",
    status: income.status,
  };
}

function stateFromSuggestion(
  suggestion: InvestmentIncomeSuggestion,
  defaults: { accountId?: null | string; categoryId?: null | string },
): IncomeFormState {
  return {
    ...initialState({
      accountId: defaults.accountId,
      categoryId: defaults.categoryId,
      exDate: suggestion.exDate,
      paymentDate: suggestion.paymentDate,
      perUnit: suggestion.amountPerUnit,
      quantity: suggestion.quantity,
      type: suggestion.type,
    }),
    netAmount: suggestion.estimatedNet,
    netTouched: false,
  };
}

function suggestedNet(
  state: Pick<IncomeFormState, "perUnit" | "quantity">,
  bps: number,
): number | undefined {
  const quantity = parseDecimal(state.quantity);
  const perUnit = parseDecimal(state.perUnit);

  if (
    quantity === null ||
    perUnit === null ||
    quantity <= ZERO ||
    perUnit <= ZERO
  ) {
    return undefined;
  }

  return Math.round((mulToCents(quantity, perUnit) * (BASIS - bps)) / BASIS);
}

function toCreateParams(
  assetId: string,
  state: IncomeFormState,
  net: number,
): CreateInvestmentIncomeParams {
  return { assetId, ...toFields(state, net) };
}

function toFields(state: IncomeFormState, net: number) {
  return {
    accountId: state.withFinance ? state.accountId : undefined,
    amountPerUnit: state.perUnit.trim() === "" ? null : state.perUnit,
    categoryId: state.withFinance ? state.categoryId : undefined,
    exDate: state.exDate ? todayCalendarDate(state.exDate) : null,
    netAmount: net,
    notes: state.notes.trim() === "" ? null : state.notes.trim(),
    paymentDate: todayCalendarDate(state.paymentDate),
    quantity: state.quantity.trim() === "" ? null : state.quantity,
    status: state.status,
    type: state.type,
    withFinance: state.withFinance,
  };
}

// Spec 115 FR 8: the series the form describes; the amount of each occurrence comes from the position.
function toSeriesParams(
  assetId: string,
  state: IncomeFormState,
): CreateInvestmentIncomeSeriesParams {
  const offset = state.exDateOffset.trim();

  return {
    accountId: state.withFinance ? state.accountId : undefined,
    amountPerUnit: state.perUnit,
    assetId,
    categoryId: state.withFinance ? state.categoryId : undefined,
    endDate: state.endDate ? todayCalendarDate(state.endDate) : null,
    exDateOffsetDays: offset === "" ? null : Number(offset),
    firstPaymentDate: todayCalendarDate(state.paymentDate),
    frequency: state.frequency,
    markPastAsReceived: state.markPast,
    notes: state.notes.trim() === "" ? null : state.notes.trim(),
    type: state.type,
    withFinance: state.withFinance,
  };
}

function toUpdateParams(
  id: string,
  state: IncomeFormState,
  net: number,
): UpdateInvestmentIncomeParams {
  return { id, ...toFields(state, net) };
}

// FR 3-4, 11: the account and the category are required (with finance), the net amount is above zero, and the optional
// quantity and per-unit value are decimals above zero when filled. Spec 115 FR 8: a series needs a per-unit value, a
// valid frequency, an end date after the first payment and an offset from 0 to 90 days.
function validate(
  state: IncomeFormState,
  net: number,
  series = false,
): IncomeFormErrors {
  const errors: IncomeFormErrors = {};

  if (state.withFinance && !state.accountId) {
    errors.accountId = "investment.form.operation.accountRequired";
  }
  if (state.withFinance && !state.categoryId) {
    errors.categoryId = "investment.income.errors.incomplete";
  }
  if (!series && net <= 0) {
    errors.netAmount = "investment.fixedIncome.redeem.invalid";
  }
  if (!isPositiveOrEmpty(state.quantity)) {
    errors.quantity = "investment.form.operation.quantityInvalid";
  }
  if (!isPositiveOrEmpty(state.perUnit)) {
    errors.amountPerUnit = "investment.form.operation.unitPriceInvalid";
  }
  if (series) {
    if (state.perUnit.trim() === "") {
      errors.amountPerUnit = "investment.form.operation.unitPriceInvalid";
    }
    if (!isRecurrenceFrequency(state.frequency)) {
      errors.frequency = "financial.recurrence.intervalErrorLonger";
    }
    if (
      state.endDate &&
      todayCalendarDate(state.endDate) < todayCalendarDate(state.paymentDate)
    ) {
      errors.endDate = "investment.income.endDateInvalid";
    }

    const offset = state.exDateOffset.trim();

    if (
      offset !== "" &&
      (!/^\d+$/.test(offset) || Number(offset) > MAX_EX_DATE_OFFSET)
    ) {
      errors.exDateOffset = "investment.income.exDateOffsetInvalid";
    }
  }

  return errors;
}

export {
  dayToDate,
  effectiveNet,
  estimateOf,
  hasErrors,
  initialState,
  isSameState,
  stateFromIncome,
  stateFromSuggestion,
  suggestedNet,
  toCreateParams,
  toSeriesParams,
  toUpdateParams,
  validate,
};
