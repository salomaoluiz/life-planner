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
import { categoryInScope } from "@screens/Financial/models/categoryTree";
import { isValidInstallmentCount } from "@screens/Financial/models/installments";
import { invoiceMonthOf } from "@screens/Financial/models/invoiceMonth";
import {
  centsToDecimalString,
  decimalStringToCents,
  MAX_TRANSACTION_CENTS,
} from "@utils/money";

const MAX_DESCRIPTION = 200;
// Spec 043 FR 4 / 18.
const MAX_TAGS = 10;
const MAX_NOTES = 1000;
const MAX_TAG_NAME = 30;

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
  // Spec 095: the invoice chosen by hand among the previous, computed and next one of the date. `undefined`
  // follows the date. On edit it holds the stored invoice when that differs from the computed one.
  invoiceMonth?: string;
  // Spec 059: free text, up to MAX_NOTES characters; empty means no note.
  notes: string;
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
  // Spec 043: tag names (at most 10); the API resolves or creates them in the owner on save.
  tags: string[];
  type: TransactionType;
}

// Spec 060: picking a description suggestion fills how that transaction was entered before; amount, date,
// paid, repeat, installments and notes stay as they are.
function applySuggestion(
  state: TransactionFormState,
  template: TransactionDTO,
  context: {
    accounts: AccountDTO[];
    cards: CreditCardDTO[];
    categories: CategoryDTO[];
  },
): TransactionFormState {
  const { accounts, cards, categories } = context;
  const type = template.type as TransactionType;
  const isCard = !!template.creditCardId;
  // An unknown, archived or foreign account/card keeps the owner's default that changeOwner picked.
  let next = changeOwner(state, template.ownerId, categories, accounts, cards);

  next = changeType(next, type, categories);
  next = changePayWith(next, isCard ? "CARD" : "ACCOUNT", categories, cards);

  const account = accounts.find((item) => item.id === template.accountId);
  const card = cards.find((item) => item.id === template.creditCardId);
  const category = categories.find((item) => item.id === template.categoryId);

  return {
    ...next,
    accountId:
      !isCard &&
      account &&
      account.status === "ACTIVE" &&
      account.ownerId === template.ownerId
        ? account.id
        : next.accountId,
    categoryId:
      category &&
      category.status === "ACTIVE" &&
      category.type === next.type &&
      categoryInScope(category, template.ownerId)
        ? category.id
        : undefined,
    creditCardId:
      isCard &&
      card &&
      card.status === "ACTIVE" &&
      card.ownerId === template.ownerId
        ? card.id
        : next.creditCardId,
    description: template.description,
    tags: template.tags.map((tag) => tag.name),
  };
}

// Spec 095 FR 15: another card has another closing day, so the choice restarts from the date.
function changeCard(
  state: TransactionFormState,
  creditCardId: string | undefined,
): TransactionFormState {
  return {
    ...state,
    creditCardId,
    invoiceMonth:
      creditCardId === state.creditCardId ? state.invoiceMonth : undefined,
  };
}

// Create: the switch follows the date until the user touches it. Edit: it shows the stored status and never follows.
function changeDate(
  state: TransactionFormState,
  date: Date,
  isEditing: boolean,
): TransactionFormState {
  // Spec 095 FR 15: a new date recomputes the invoice; the user can pick again afterwards.
  const next = { ...state, date: normalizeDate(date), invoiceMonth: undefined };

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

// Spec 095 FR 14: the choice, or `undefined` to follow the date.
function changeInvoiceMonth(
  state: TransactionFormState,
  month: string | undefined,
): TransactionFormState {
  return { ...state, invoiceMonth: month };
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

  const creditCardId =
    card && card.ownerId === ownerId
      ? state.creditCardId
      : defaultCardId(cards, ownerId);

  return {
    ...state,
    accountId:
      account && account.ownerId === ownerId
        ? state.accountId
        : defaultAccountId(accounts, ownerId),
    categoryId:
      category && categoryInScope(category, ownerId)
        ? state.categoryId
        : undefined,
    creditCardId,
    invoiceMonth:
      creditCardId === state.creditCardId ? state.invoiceMonth : undefined,
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
      invoiceMonth: undefined,
      // Coming back from a card the status restarts from the date.
      paid: state.payWith === "CARD" ? !isAfterToday(state.date) : state.paid,
      paidTouched: state.payWith === "CARD" ? false : state.paidTouched,
      payWith,
    };
  }

  return {
    ...changeType(
      { ...state, invoiceMonth: undefined, payWith },
      TransactionType.EXPENSE,
      categories,
    ),
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

// What a new transaction starts with for Repeat and Installments; shared with resetForNext.
const REPEAT_AND_INSTALLMENTS_DEFAULTS = {
  installmentsCount: 2,
  installmentsOn: false,
  repeatEnd: undefined,
  repeatFrequency: "MONTHLY",
  repeatOn: false,
} as const satisfies Pick<
  TransactionFormState,
  | "installmentsCount"
  | "installmentsOn"
  | "repeatEnd"
  | "repeatFrequency"
  | "repeatOn"
>;

// What the invoice rules need beyond the form: the card's closing day and, when editing, what is stored.
interface InvoiceContext {
  closingDay: number;
  storedCardId?: string;
  // `YYYY-MM-DD` of the stored row.
  storedDate?: string;
  storedMonth?: string;
}

// Installments (spec 030): the form amount is the TOTAL, the API splits it.
// `YYYY-MM-DD` of a local date, the format the billing rules work on.
function calendarDayOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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
    ...REPEAT_AND_INSTALLMENTS_DEFAULTS,
    notes: "",
    ownerId,
    paid: true,
    paidTouched: false,
    payWith: params.card ? "CARD" : "ACCOUNT",
    tags: [],
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

// Spec 095 FR 3, 14: the invoice the form shows as selected.
function effectiveInvoiceMonth(
  state: TransactionFormState,
  closingDay: number,
): string {
  return (
    state.invoiceMonth ?? invoiceMonthOf(calendarDayOf(state.date), closingDay)
  );
}

// Spec 095 FR 16: the month goes to the API only when it differs from what the API would pick anyway.
// Create: the computed month. Edit: the stored month, or the computed one once the date or the card changed
// (the API recomputes then), so "Usar a da data" on a row moved by hand sends the computed month.
function invoiceMonthToSend(
  state: TransactionFormState,
  invoice: InvoiceContext | undefined,
): string | undefined {
  if (!invoice || state.payWith !== "CARD") {
    return undefined;
  }

  const computed = invoiceMonthOf(
    calendarDayOf(state.date),
    invoice.closingDay,
  );
  const effective = effectiveInvoiceMonth(state, invoice.closingDay);

  if (invoice.storedMonth === undefined) {
    return effective === computed ? undefined : effective;
  }

  const recomputed =
    state.creditCardId !== invoice.storedCardId ||
    calendarDayOf(state.date) !== invoice.storedDate;

  return effective === (recomputed ? computed : invoice.storedMonth)
    ? undefined
    : effective;
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
    a.invoiceMonth === b.invoiceMonth &&
    a.notes === b.notes &&
    a.ownerId === b.ownerId &&
    a.paid === b.paid &&
    a.payWith === b.payWith &&
    a.repeatEnd?.getTime() === b.repeatEnd?.getTime() &&
    a.repeatFrequency === b.repeatFrequency &&
    a.repeatOn === b.repeatOn &&
    a.tags.length === b.tags.length &&
    a.tags.every((tag, index) => tag === b.tags[index]) &&
    a.type === b.type
  );
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// A new record sends the notes only when there are some.
function notesToCreate(state: TransactionFormState) {
  return state.notes.trim() || undefined;
}

function pickNewRecordId(previousIds: string[], current: { id: string }[]) {
  return current.find((record) => !previousIds.includes(record.id))?.id;
}

// "Save and add another" (spec 039): keeps what repeats from one entry to the next
// (type, category, account/card, date, owner) and clears what changes every time.
function resetForNext(state: TransactionFormState): TransactionFormState {
  return {
    ...state,
    ...REPEAT_AND_INSTALLMENTS_DEFAULTS,
    amountCents: 0,
    description: "",
    // The date is kept, the manual invoice is not (spec 095 FR 19).
    invoiceMonth: undefined,
    notes: "",
    originalPaid: undefined,
    paid: !isAfterToday(state.date),
    paidTouched: false,
  };
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
    // Spec 095 FR 17: the stored invoice is the selected one; the form drops it when it equals the computed one.
    invoiceMonth: dto.creditCardId ? dto.invoiceMonth : undefined,
    notes: dto.notes ?? "",
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
    tags: dto.tags.map((tag) => tag.name),
    type: dto.type as TransactionType,
  };
}

function toCreateInstallmentParams(
  state: TransactionFormState,
  owner: OwnerDTO,
  invoice?: InvoiceContext,
): CreateInstallmentPlanUseCaseParams {
  return {
    categoryId: state.categoryId!,
    creditCardId: state.creditCardId!,
    date: state.date.toISOString(),
    description: state.description.trim(),
    // Spec 095 FR 16, 18: the invoice of the 1st installment, only when it is not the computed one.
    firstInvoiceMonth: invoiceMonthToSend(state, invoice),
    installments: state.installmentsCount,
    notes: notesToCreate(state),
    owner: owner.type,
    ownerId: owner.id,
    tags: state.tags,
    value: centsToDecimalString(state.amountCents),
  };
}

function toCreateParams(
  state: TransactionFormState,
  owner: OwnerDTO,
  categoryName: string,
  invoice?: InvoiceContext,
): CreateTransactionUseCaseParams {
  const isCard = state.payWith === "CARD";

  return {
    accountId: isCard ? undefined : state.accountId,
    category: categoryName,
    categoryId: state.categoryId!,
    creditCardId: isCard ? state.creditCardId : undefined,
    date: state.date.toISOString(),
    description: state.description.trim(),
    invoiceMonth: invoiceMonthToSend(state, invoice),
    notes: notesToCreate(state),
    owner: owner.type,
    ownerId: owner.id,
    // A card purchase follows its invoice: no status is sent (spec 033 FR 2).
    paid: isCard ? undefined : state.paid,
    tags: state.tags,
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
    notes: notesToCreate(state),
    owner: owner.type,
    ownerId: owner.id,
    paid: isCard ? undefined : state.paid,
    tags: state.tags,
    type: state.type,
    value: centsToDecimalString(state.amountCents),
  };
}

function toUpdateParams(
  id: string,
  state: TransactionFormState,
  owner: OwnerDTO,
  categoryName: string,
  invoice?: InvoiceContext,
): UpdateTransactionUseCaseParams {
  // An edit clears the notes with `null` (absent would leave them).
  return {
    ...toCreateParams(state, owner, categoryName, invoice),
    id,
    notes: state.notes.trim() || null,
  };
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

export type {
  InvoiceContext,
  PayWith,
  TransactionFormErrors,
  TransactionFormState,
};
export {
  applySuggestion,
  calendarDayOf,
  changeCard,
  changeDate,
  changeInstallmentsOn,
  changeInvoiceMonth,
  changeOwner,
  changePaid,
  changePayWith,
  changeRepeatOn,
  changeType,
  chipCategories,
  createInitialState,
  defaultAccountId,
  defaultCardId,
  effectiveInvoiceMonth,
  invoiceMonthToSend,
  isSameState,
  MAX_NOTES,
  MAX_TAG_NAME,
  MAX_TAGS,
  normalizeDate,
  pickNewRecordId,
  resetForNext,
  stateFromDto,
  toCreateInstallmentParams,
  toCreateParams,
  toCreateRecurrenceParams,
  toUpdateParams,
  validate,
};
