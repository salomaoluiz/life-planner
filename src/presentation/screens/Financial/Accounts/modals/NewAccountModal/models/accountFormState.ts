import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateAccountUseCaseParams } from "@application/useCases/cases/financial/accounts/createAccountUseCase";
import { UpdateAccountUseCaseParams } from "@application/useCases/cases/financial/accounts/updateAccountUseCase";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  centsToDecimal,
  decimalToCents,
  MAX_TRANSACTION_CENTS,
} from "@utils/money";

const MAX_NAME = 60;

type AccountFormErrors = Partial<Record<"amount" | "name", TranslationKeys>>;

interface AccountFormState {
  amountCents: number;
  icon: string;
  isArchived: boolean;
  isNegative: boolean;
  name: string;
  ownerId: string;
}

function createInitialState(params: { ownerId: string }): AccountFormState {
  return {
    amountCents: 0,
    icon: "bank",
    isArchived: false,
    isNegative: false,
    name: "",
    ownerId: params.ownerId,
  };
}

function isSameState(a: AccountFormState, b: AccountFormState) {
  return (
    a.amountCents === b.amountCents &&
    a.icon === b.icon &&
    a.isArchived === b.isArchived &&
    a.isNegative === b.isNegative &&
    a.name === b.name &&
    a.ownerId === b.ownerId
  );
}

function signedBalance(state: AccountFormState): number {
  if (state.amountCents === 0) {
    return 0;
  }

  return centsToDecimal(
    state.isNegative ? -state.amountCents : state.amountCents,
  );
}

function stateFromDto(dto: AccountDTO): AccountFormState {
  const cents = decimalToCents(dto.balance);

  return {
    amountCents: Math.abs(cents),
    icon: dto.icon,
    isArchived: dto.status === "ARCHIVED",
    isNegative: cents < 0,
    name: dto.name,
    ownerId: dto.ownerId,
  };
}

function toCreateParams(
  state: AccountFormState,
  owner: OwnerDTO,
): CreateAccountUseCaseParams {
  return {
    balance: signedBalance(state),
    icon: state.icon,
    name: state.name.trim(),
    owner: owner.type,
    ownerId: owner.id,
    status: "ACTIVE",
  };
}

// Only changed fields travel; owner/ownerId are immutable (the API answers 400 otherwise).
function toUpdateParams(
  id: string,
  state: AccountFormState,
  initial: AccountFormState,
): UpdateAccountUseCaseParams {
  const params: UpdateAccountUseCaseParams = { id };

  if (state.name.trim() !== initial.name.trim()) {
    params.name = state.name.trim();
  }
  if (state.icon !== initial.icon) {
    params.icon = state.icon;
  }
  if (signedBalance(state) !== signedBalance(initial)) {
    params.balance = signedBalance(state);
  }
  if (state.isArchived !== initial.isArchived) {
    params.status = state.isArchived ? "ARCHIVED" : "ACTIVE";
  }

  return params;
}

function validate(state: AccountFormState): AccountFormErrors {
  const errors: AccountFormErrors = {};
  const name = state.name.trim();

  if (!name) {
    errors.name = "financial.accounts.nameRequired";
  } else if (name.length > MAX_NAME) {
    errors.name = "financial.accounts.form.errors.nameTooLong";
  }
  if (state.amountCents > MAX_TRANSACTION_CENTS) {
    errors.amount = "financial.accounts.form.errors.balanceTooLarge";
  }

  return errors;
}

export type { AccountFormErrors, AccountFormState };
export {
  createInitialState,
  isSameState,
  signedBalance,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
};
