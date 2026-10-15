import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateTransactionUseCaseParams } from "@application/useCases/cases/financial/transactions/createTransactionUseCase";
import { UpdateTransactionUseCaseParams } from "@application/useCases/cases/financial/transactions/updateTransactionUseCase";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { TranslationKeys } from "@presentation/i18n/types";
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
    | "description",
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
  ownerId: string;
  payWith: PayWith;
  type: TransactionType;
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

// Card purchases are expenses: switching to Card fixes the type (and drops an income category).
function changePayWith(
  state: TransactionFormState,
  payWith: PayWith,
  categories: CategoryDTO[],
  cards: CreditCardDTO[],
): TransactionFormState {
  if (payWith === "ACCOUNT") {
    return { ...state, payWith };
  }

  return {
    ...changeType({ ...state, payWith }, TransactionType.EXPENSE, categories),
    creditCardId: state.creditCardId ?? defaultCardId(cards, state.ownerId),
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
    ownerId,
    payWith: params.card ? "CARD" : "ACCOUNT",
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

function isSameState(a: TransactionFormState, b: TransactionFormState) {
  return (
    a.accountId === b.accountId &&
    a.amountCents === b.amountCents &&
    a.categoryId === b.categoryId &&
    a.creditCardId === b.creditCardId &&
    a.date.getTime() === b.date.getTime() &&
    a.description === b.description &&
    a.ownerId === b.ownerId &&
    a.payWith === b.payWith &&
    a.type === b.type
  );
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function pickNewRecordId(previousIds: string[], current: { id: string }[]) {
  return current.find((record) => !previousIds.includes(record.id))?.id;
}

function stateFromDto(dto: TransactionDTO): TransactionFormState {
  return {
    accountId: dto.accountId,
    amountCents: decimalStringToCents(dto.value),
    categoryId: dto.categoryId,
    creditCardId: dto.creditCardId,
    date: normalizeDate(new Date(dto.date)),
    description: dto.description,
    ownerId: dto.ownerId,
    payWith: dto.creditCardId ? "CARD" : "ACCOUNT",
    type: dto.type as TransactionType,
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
  if (Number.isNaN(state.date.getTime())) {
    errors.date = "financial.transactions.form.errors.dateRequired";
  }

  return errors;
}

export type { PayWith, TransactionFormErrors, TransactionFormState };
export {
  changeOwner,
  changePayWith,
  changeType,
  chipCategories,
  createInitialState,
  defaultAccountId,
  defaultCardId,
  isSameState,
  normalizeDate,
  pickNewRecordId,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
};
