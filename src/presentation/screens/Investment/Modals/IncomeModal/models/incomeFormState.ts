import { todayCalendarDate } from "@data/models/financial/calendarDate";
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
  UpdateInvestmentIncomeParams,
} from "@domain/repositories/investment";
import { TranslationKeys } from "@presentation/i18n/types";
import { mulToCents, parseDecimal, ZERO } from "@utils/decimal";

const BASIS = 10000;

export interface IncomeFormErrors {
  accountId?: TranslationKeys;
  amountPerUnit?: TranslationKeys;
  categoryId?: TranslationKeys;
  netAmount?: TranslationKeys;
  quantity?: TranslationKeys;
}

export interface IncomeFormState {
  accountId: string;
  categoryId: string;
  exDate?: Date;
  // Cents typed by the owner; only used once `netTouched` (or when quantity × per unit cannot be computed).
  netAmount: number;
  netTouched: boolean;
  notes: string;
  paymentDate: Date;
  perUnit: string;
  quantity: string;
  status: InvestmentIncomeStatus;
  type: InvestmentIncomeType;
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
}): IncomeFormState {
  return {
    accountId: params.accountId ?? "",
    categoryId: params.categoryId ?? "",
    exDate: params.exDate ? dayToDate(params.exDate) : undefined,
    netAmount: 0,
    netTouched: false,
    notes: "",
    paymentDate: params.paymentDate
      ? dayToDate(params.paymentDate)
      : new Date(),
    perUnit: params.perUnit ?? "",
    quantity: params.quantity ?? "",
    status: InvestmentIncomeStatus.PLANNED,
    type: params.type,
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
    a.perUnit === b.perUnit &&
    a.quantity === b.quantity &&
    a.status === b.status &&
    a.type === b.type &&
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
    accountId: state.accountId,
    amountPerUnit: state.perUnit.trim() === "" ? null : state.perUnit,
    categoryId: state.categoryId,
    exDate: state.exDate ? todayCalendarDate(state.exDate) : null,
    netAmount: net,
    notes: state.notes.trim() === "" ? null : state.notes.trim(),
    paymentDate: todayCalendarDate(state.paymentDate),
    quantity: state.quantity.trim() === "" ? null : state.quantity,
    status: state.status,
    type: state.type,
  };
}

function toUpdateParams(
  id: string,
  state: IncomeFormState,
  net: number,
): UpdateInvestmentIncomeParams {
  return { id, ...toFields(state, net) };
}

// FR 3-4, 11: the account and the category are required, the net amount is above zero, and the optional quantity and
// per-unit value are decimals above zero when filled.
function validate(state: IncomeFormState, net: number): IncomeFormErrors {
  const errors: IncomeFormErrors = {};

  if (!state.accountId) {
    errors.accountId = "investment.form.operation.accountRequired";
  }
  if (!state.categoryId) {
    errors.categoryId = "investment.income.errors.incomplete";
  }
  if (net <= 0) {
    errors.netAmount = "investment.fixedIncome.redeem.invalid";
  }
  if (!isPositiveOrEmpty(state.quantity)) {
    errors.quantity = "investment.form.operation.quantityInvalid";
  }
  if (!isPositiveOrEmpty(state.perUnit)) {
    errors.amountPerUnit = "investment.form.operation.unitPriceInvalid";
  }

  return errors;
}

export {
  effectiveNet,
  estimateOf,
  hasErrors,
  initialState,
  isSameState,
  stateFromIncome,
  stateFromSuggestion,
  suggestedNet,
  toCreateParams,
  toUpdateParams,
  validate,
};
