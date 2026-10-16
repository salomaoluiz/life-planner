import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { UpdateInstallmentPlanUseCaseParams } from "@application/useCases/cases/financial/installmentPlans/updateInstallmentPlanUseCase";
import { UpdateTransactionUseCaseParams } from "@application/useCases/cases/financial/transactions/updateTransactionUseCase";
import { TranslationKeys } from "@presentation/i18n/types";
import { isValidInstallmentCount } from "@screens/Financial/models/installments";
import {
  centsToDecimalString,
  decimalStringToCents,
  MAX_TRANSACTION_CENTS,
} from "@utils/money";

const MAX_DESCRIPTION = 200;

interface EditableFields {
  amount: boolean;
  card: boolean;
  category: boolean;
  count: boolean;
  date: boolean;
  description: boolean;
}

type EditScope = "ALL" | "ONLY_THIS" | "THIS_AND_NEXT";

type InstallmentEditErrors = Partial<
  Record<"amount" | "categoryId" | "count" | "description", TranslationKeys>
>;

interface InstallmentEditState {
  amountCents: number;
  categoryId: string;
  count: number;
  creditCardId: string;
  date: Date;
  description: string;
  scope: EditScope;
}

function changed<T>(value: T, stored: T): T | undefined {
  return value === stored ? undefined : value;
}

// "Only this one" and "This and the next ones" edit the value of one row; "All" edits the plan TOTAL.
function changeScope(
  state: InstallmentEditState,
  scope: EditScope,
  plan: InstallmentPlanDTO,
  transaction: TransactionDTO,
): InstallmentEditState {
  const amount = scope === "ALL" ? plan.totalValue : transaction.value;

  return { ...state, amountCents: decimalStringToCents(amount), scope };
}

function dayOf(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// FR 12 and 16: what each option can change; in a paid invoice only description and category.
function editableFields(scope: EditScope, paid: boolean): EditableFields {
  if (paid) {
    return {
      amount: false,
      card: false,
      category: true,
      count: false,
      date: false,
      description: true,
    };
  }

  const all = scope === "ALL";

  return {
    amount: true,
    card: all,
    category: true,
    count: all,
    date: all,
    description: true,
  };
}

function initialState(
  plan: InstallmentPlanDTO,
  transaction: TransactionDTO,
): InstallmentEditState {
  return {
    amountCents: decimalStringToCents(transaction.value),
    categoryId: transaction.categoryId,
    count: plan.installmentCount,
    creditCardId: plan.creditCardId,
    date: dayOf(new Date(plan.date)),
    description: transaction.description,
    scope: "ONLY_THIS",
  };
}

function isSameState(a: InstallmentEditState, b: InstallmentEditState) {
  return (
    a.amountCents === b.amountCents &&
    a.categoryId === b.categoryId &&
    a.count === b.count &&
    a.creditCardId === b.creditCardId &&
    a.date.getTime() === b.date.getTime() &&
    a.description === b.description &&
    a.scope === b.scope
  );
}

function isStructural(plan: InstallmentPlanDTO, state: InstallmentEditState) {
  return (
    state.amountCents !== decimalStringToCents(plan.totalValue) ||
    state.count !== plan.installmentCount ||
    state.creditCardId !== plan.creditCardId ||
    state.date.getTime() !== dayOf(new Date(plan.date)).getTime()
  );
}

// FR 15: only a real change of total, count, card or date asks for the confirmation.
function needsRecalcConfirm(
  plan: InstallmentPlanDTO,
  state: InstallmentEditState,
) {
  return state.scope === "ALL" && isStructural(plan, state);
}

// "All": only the changed fields; a structural field equal to the stored one is never sent, so the
// API does not recalculate (and keep the single-installment adjustments).
function toPlanUpdate(
  plan: InstallmentPlanDTO,
  state: InstallmentEditState,
  paid: boolean,
): UpdateInstallmentPlanUseCaseParams {
  const structural = !paid;

  return {
    categoryId: changed(state.categoryId, plan.categoryId),
    creditCardId: structural
      ? changed(state.creditCardId, plan.creditCardId)
      : undefined,
    date:
      structural &&
      dayOf(new Date(plan.date)).getTime() !== state.date.getTime()
        ? state.date.toISOString()
        : undefined,
    description: changed(state.description.trim(), plan.description),
    id: plan.id,
    installments: structural
      ? changed(state.count, plan.installmentCount)
      : undefined,
    value:
      structural && state.amountCents !== decimalStringToCents(plan.totalValue)
        ? centsToDecimalString(state.amountCents)
        : undefined,
  };
}

// "Only this one" / "This and the next ones": value, description and category of the row (scope is required by the API).
function toTransactionUpdate(
  transaction: TransactionDTO,
  state: InstallmentEditState,
  paid: boolean,
): UpdateTransactionUseCaseParams {
  return {
    categoryId: changed(state.categoryId, transaction.categoryId),
    description: changed(state.description.trim(), transaction.description),
    id: transaction.id,
    scope: state.scope === "THIS_AND_NEXT" ? "THIS_AND_NEXT" : "ONLY_THIS",
    value:
      !paid && state.amountCents !== decimalStringToCents(transaction.value)
        ? centsToDecimalString(state.amountCents)
        : undefined,
  };
}

function validate(
  state: InstallmentEditState,
  fields: EditableFields,
): InstallmentEditErrors {
  const errors: InstallmentEditErrors = {};
  const description = state.description.trim();

  if (fields.amount) {
    if (state.amountCents <= 0) {
      errors.amount = "financial.transactions.form.errors.amountRequired";
    } else if (state.amountCents > MAX_TRANSACTION_CENTS) {
      errors.amount = "financial.transactions.form.errors.amountTooLarge";
    }
  }
  if (!description) {
    errors.description =
      "financial.transactions.form.errors.descriptionRequired";
  } else if (description.length > MAX_DESCRIPTION) {
    errors.description =
      "financial.transactions.form.errors.descriptionTooLong";
  }
  if (!state.categoryId) {
    errors.categoryId = "financial.transactions.form.errors.categoryRequired";
  }
  if (
    fields.count &&
    (!isValidInstallmentCount(state.count) || state.amountCents < state.count)
  ) {
    errors.count = "financial.transactions.form.errors.installmentsRange";
  }

  return errors;
}

export type {
  EditableFields,
  EditScope,
  InstallmentEditErrors,
  InstallmentEditState,
};
export {
  changeScope,
  editableFields,
  initialState,
  isSameState,
  needsRecalcConfirm,
  toPlanUpdate,
  toTransactionUpdate,
  validate,
};
