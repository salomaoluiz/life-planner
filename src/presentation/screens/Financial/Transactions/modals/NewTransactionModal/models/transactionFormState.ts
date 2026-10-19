import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import RecurrenceDTO from "@application/dto/financial/RecurrenceDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateInstallmentPlanUseCaseParams } from "@application/useCases/cases/financial/installmentPlans/createInstallmentPlanUseCase";
import { CreateRecurrenceUseCaseParams } from "@application/useCases/cases/financial/recurrences/createRecurrenceUseCase";
import { CreateTransactionUseCaseParams } from "@application/useCases/cases/financial/transactions/createTransactionUseCase";
import { UpdateTransactionUseCaseParams } from "@application/useCases/cases/financial/transactions/updateTransactionUseCase";
import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import { isValidInstallmentCount } from "@screens/Financial/models/installments";
import {
  centsToDecimalString,
  decimalStringToCents,
  MAX_TRANSACTION_CENTS,
} from "@utils/money";

const MAX_DESCRIPTION = 200;

type PayWith = "ACCOUNT" | "CARD";

type TransactionFormErrors = Partial<
  Record<
    | "accountId"
    | "amount"
    | "categoryId"
    | "creditCardId"
    | "date"
    | "description"
    | "installments"
    | "repeatEnd",
    TranslationKeys
  >
>;

interface TransactionFormState {
  accountId?: string;
  amountCents: number;
  categoryId?: string;
  creditCardId?: string;
  date: Date;
  description: string;
  // Card purchases only (spec 030): the amount is then the TOTAL split in `installmentsCount` parts.
  installmentsCount: number;
  installmentsOn: boolean;
  // Origin of the transaction being edited: true/false = its stored status, undefined while creating.
  originalPaid?: boolean;
  ownerId: string;
  // Account rows only (spec 033): the "Paid" switch; on create it follows the date until touched.
  paid: boolean;
  paidTouched: boolean;
  payWith: PayWith;
  // Spec 034: "Repeat". Create: a new series; edit: the series of the occurrence being edited.
  repeatEnd?: Date;
  repeatFrequency: RecurrenceFrequency;
  repeatOn: boolean;
  type: TransactionType;
}

// Create: the switch follows the date until the user touches it. Edit: it shows the stored status and never follows.
function changeDate(
  state: TransactionFormState,
  date: Date,
  isEditing: boolean,
): TransactionFormState {
  const next = { ...state, date: normalizeDate(date) };

  return isEditing || state.paidTouched
    ? next
    : { ...next, paid: !isAfterToday(next.date) };
}

// "Repeat" and "Installments" never go together (spec 034 FR 17).
function changeInstallmentsOn(
  state: TransactionFormState,
  on: boolean,
): TransactionFormState {
  return {
    ...state,
    installmentsOn: on,
    repeatOn: on ? false : state.repeatOn,
  };
}

function changeOwner(
  state: TransactionFormState,
  ownerId: string,
  categories: CategoryDTO[],
  accounts: AccountDTO[],
  cards: CreditCardDTO[] = [],
): TransactionFormState {
  const category = categories.find((item) => item.id === state.categoryId);
  const account = accounts.find((item) => item.id === state.accountId);
  const card = cards.find((item) => item.id === state.creditCardId);

  return {
    ...state,
    accountId:
      account && account.ownerId === ownerId
        ? state.accountId
        : defaultAccountId(accounts, ownerId),
    categoryId:
      category && category.ownerId === ownerId ? state.categoryId : undefined,
    creditCardId:
      card && card.ownerId === ownerId
        ? state.creditCardId
        : defaultCardId(cards, ownerId),
    ownerId,
  };
}

// Marking a transaction as paid makes its date the payment day (FR 19): a future date, or an unpaid
// stored row being paid, moves to today. The user can still pick another day afterwards.
function changePaid(
  state: TransactionFormState,
  paid: boolean,
  isEditing: boolean,
): TransactionFormState {
  const movesToToday =
    paid &&
    (isEditing ? state.originalPaid === false : isAfterToday(state.date));

  return {
    ...state,
    date: movesToToday ? normalizeDate(new Date()) : state.date,
    paid,
    paidTouched: true,
  };
}

// Card purchases are expenses: switching to Card fixes the type (and drops an income category).
function changePayWith(
  state: TransactionFormState,
  payWith: PayWith,
  categories: CategoryDTO[],
  cards: CreditCardDTO[],
): TransactionFormState {
  if (payWith === "ACCOUNT") {
    return {
      ...state,
      installmentsCount: 2,
      installmentsOn: false,
      // Coming back from a card the status restarts from the date.
      paid: state.payWith === "CARD" ? !isAfterToday(state.date) : state.paid,
      paidTouched: state.payWith === "CARD" ? false : state.paidTouched,
      payWith,
    };
  }

  return {
    ...changeType({ ...state, payWith }, TransactionType.EXPENSE, categories),
    creditCardId: state.creditCardId ?? defaultCardId(cards, state.ownerId),
  };
}

function changeRepeatOn(
  state: TransactionFormState,
  on: boolean,
): TransactionFormState {
  return {
    ...state,
    installmentsOn: on ? false : state.installmentsOn,
    repeatOn: on,
  };
}

function changeType(
  state: TransactionFormState,
  type: TransactionType,
  categories: CategoryDTO[],
): TransactionFormState {
  const selected = categories.find(
    (category) => category.id === state.categoryId,
  );

  return {
    ...state,
    categoryId:
      selected && selected.type === type ? state.categoryId : undefined,
    type,
  };
}

function chipCategories(
  top: CategoryDTO[],
  selectedId: string | undefined,
  all: CategoryDTO[],
): CategoryDTO[] {
  const selected = all.find((category) => category.id === selectedId);

  return selected && !top.some((category) => category.id === selected.id)
    ? [...top, selected]
    : top;
}

function createInitialState(params: {
  accounts: AccountDTO[];
  // A card to start on ("Add purchase" from an invoice): opens in Card mode with the card's owner.
  card?: CreditCardDTO;
  now: Date;
  ownerId: string;
}): TransactionFormState {
  const ownerId = params.card?.ownerId ?? params.ownerId;

  return {
    accountId: defaultAccountId(params.accounts, ownerId),
    amountCents: 0,
    categoryId: undefined,
    creditCardId: params.card?.id,
    date: normalizeDate(params.now),
    description: "",
    installmentsCount: 2,
    installmentsOn: false,
    ownerId,
    paid: true,
    paidTouched: false,
    payWith: params.card ? "CARD" : "ACCOUNT",
    repeatEnd: undefined,
    repeatFrequency: "MONTHLY",
    repeatOn: false,
    type: TransactionType.EXPENSE,
  };
}

function defaultAccountId(accounts: AccountDTO[], ownerId: string) {
  return accounts.find(
    (account) => account.ownerId === ownerId && account.status === "ACTIVE",
  )?.id;
}

function defaultCardId(cards: CreditCardDTO[], ownerId: string) {
  return cards.find(
    (card) => card.ownerId === ownerId && card.status === "ACTIVE",
  )?.id;
}

function isAfterToday(date: Date) {
  return normalizeDate(date).getTime() > normalizeDate(new Date()).getTime();
}

function isSameState(a: TransactionFormState, b: TransactionFormState) {
  return (
    a.accountId === b.accountId &&
    a.amountCents === b.amountCents &&
    a.categoryId === b.categoryId &&
    a.creditCardId === b.creditCardId &&
    a.date.getTime() === b.date.getTime() &&
    a.description === b.description &&
    a.installmentsCount === b.installmentsCount &&
    a.installmentsOn === b.installmentsOn &&
    a.ownerId === b.ownerId &&
    a.paid === b.paid &&
    a.payWith === b.payWith &&
    a.repeatEnd?.getTime() === b.repeatEnd?.getTime() &&
    a.repeatFrequency === b.repeatFrequency &&
    a.repeatOn === b.repeatOn &&
    a.type === b.type
  );
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function pickNewRecordId(previousIds: string[], current: { id: string }[]) {
  return current.find((record) => !previousIds.includes(record.id))?.id;
}

function stateFromDto(
  dto: TransactionDTO,
  series?: RecurrenceDTO,
): TransactionFormState {
  return {
    accountId: dto.accountId,
    amountCents: decimalStringToCents(dto.value),
    categoryId: dto.categoryId,
    creditCardId: dto.creditCardId,
    date: normalizeDate(new Date(dto.date)),
    description: dto.description,
    installmentsCount: dto.installmentCount ?? 2,
    installmentsOn: false,
    originalPaid: dto.paid,
    ownerId: dto.ownerId,
    paid: dto.paid,
    paidTouched: true,
    payWith: dto.creditCardId ? "CARD" : "ACCOUNT",
    repeatEnd: series?.endDate
      ? normalizeDate(new Date(series.endDate))
      : undefined,
    repeatFrequency: dto.recurrenceFrequency ?? series?.frequency ?? "MONTHLY",
    repeatOn: !!dto.recurrenceId,
    type: dto.type as TransactionType,
  };
}

// Installments (spec 030): the form amount is the TOTAL, the API splits it.
function toCreateInstallmentParams(
  state: TransactionFormState,
  owner: OwnerDTO,
): CreateInstallmentPlanUseCaseParams {
  return {
    categoryId: state.categoryId!,
    creditCardId: state.creditCardId!,
    date: state.date.toISOString(),
    description: state.description.trim(),
    installments: state.installmentsCount,
    owner: owner.type,
    ownerId: owner.id,
    value: centsToDecimalString(state.amountCents),
  };
}

function toCreateParams(
  state: TransactionFormState,
  owner: OwnerDTO,
  categoryName: string,
): CreateTransactionUseCaseParams {
  const isCard = state.payWith === "CARD";

  return {
    accountId: isCard ? undefined : state.accountId,
    category: categoryName,
    categoryId: state.categoryId!,
    creditCardId: isCard ? state.creditCardId : undefined,
    date: state.date.toISOString(),
    description: state.description.trim(),
    owner: owner.type,
    ownerId: owner.id,
    // A card purchase follows its invoice: no status is sent (spec 033 FR 2).
    paid: isCard ? undefined : state.paid,
    type: state.type,
    value: centsToDecimalString(state.amountCents),
  };
}

// Repeat (spec 034): the date is occurrence 1; `paid` applies to it only (account series).
function toCreateRecurrenceParams(
  state: TransactionFormState,
  owner: OwnerDTO,
): CreateRecurrenceUseCaseParams {
  const isCard = state.payWith === "CARD";

  return {
    accountId: isCard ? undefined : state.accountId,
    categoryId: state.categoryId!,
    creditCardId: isCard ? state.creditCardId : undefined,
    date: state.date.toISOString(),
    description: state.description.trim(),
    endDate: state.repeatEnd?.toISOString(),
    frequency: state.repeatFrequency,
    owner: owner.type,
    ownerId: owner.id,
    paid: isCard ? undefined : state.paid,
    type: state.type,
    value: centsToDecimalString(state.amountCents),
  };
}

function toUpdateParams(
  id: string,
  state: TransactionFormState,
  owner: OwnerDTO,
  categoryName: string,
): UpdateTransactionUseCaseParams {
  return { ...toCreateParams(state, owner, categoryName), id };
}

function validate(state: TransactionFormState): TransactionFormErrors {
  const errors: TransactionFormErrors = {};
  const description = state.description.trim();

  if (state.amountCents <= 0) {
    errors.amount = "financial.transactions.form.errors.amountRequired";
  } else if (state.amountCents > MAX_TRANSACTION_CENTS) {
    errors.amount = "financial.transactions.form.errors.amountTooLarge";
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
  if (state.payWith === "CARD") {
    if (!state.creditCardId) {
      errors.creditCardId = "financial.transactions.form.errors.cardRequired";
    }
  } else if (!state.accountId) {
    errors.accountId = "financial.transactions.form.errors.accountRequired";
  }
  if (
    state.payWith === "CARD" &&
    state.installmentsOn &&
    (!isValidInstallmentCount(state.installmentsCount) ||
      state.amountCents < state.installmentsCount)
  ) {
    errors.installments =
      "financial.transactions.form.errors.installmentsRange";
  }
  if (
    state.repeatOn &&
    state.repeatEnd &&
    normalizeDate(state.repeatEnd).getTime() <
      normalizeDate(state.date).getTime()
  ) {
    errors.repeatEnd =
      "financial.transactions.form.errors.repeatEndBeforeStart";
  }
  if (Number.isNaN(state.date.getTime())) {
    errors.date = "financial.transactions.form.errors.dateRequired";
  }

  return errors;
}

export type { PayWith, TransactionFormErrors, TransactionFormState };
export {
  changeDate,
  changeInstallmentsOn,
  changeOwner,
  changePaid,
  changePayWith,
  changeRepeatOn,
  changeType,
  chipCategories,
  createInitialState,
  defaultAccountId,
  defaultCardId,
  isSameState,
  normalizeDate,
  pickNewRecordId,
  stateFromDto,
  toCreateInstallmentParams,
  toCreateParams,
  toCreateRecurrenceParams,
  toUpdateParams,
  validate,
};
