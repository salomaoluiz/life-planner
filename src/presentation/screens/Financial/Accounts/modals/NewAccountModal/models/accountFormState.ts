import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateAccountUseCaseParams } from "@application/useCases/cases/financial/accounts/createAccountUseCase";
import { UpdateAccountUseCaseParams } from "@application/useCases/cases/financial/accounts/updateAccountUseCase";
import { AccountType } from "@domain/entities/financial/AccountEntity";
import { DEFAULT_ICON_BY_TYPE } from "@presentation/constants/accountIcons";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  centsToDecimal,
  decimalToCents,
  MAX_TRANSACTION_CENTS,
} from "@utils/money";

const MAX_NAME = 60;

// What an edit changes: the account fields plus, apart, the balance the user wants to see.
type AccountChanges = UpdateAccountUseCaseParams & { balance?: number };

type AccountFormErrors = Partial<Record<"amount" | "name", TranslationKeys>>;

interface AccountFormState {
  amountCents: number;
  icon: string;
  // Spec 101: false until the user picks an icon by hand; the type suggests the icon meanwhile.
  iconTouched: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  isNegative: boolean;
  name: string;
  ownerId: string;
  type: AccountType;
}

function createInitialState(params: { ownerId: string }): AccountFormState {
  return {
    amountCents: 0,
    icon: DEFAULT_ICON_BY_TYPE[AccountType.CHECKING],
    iconTouched: false,
    isArchived: false,
    isFavorite: false,
    isNegative: false,
    name: "",
    ownerId: params.ownerId,
    type: AccountType.CHECKING,
  };
}

function isSameState(a: AccountFormState, b: AccountFormState) {
  return (
    a.amountCents === b.amountCents &&
    a.icon === b.icon &&
    a.isArchived === b.isArchived &&
    a.isFavorite === b.isFavorite &&
    a.isNegative === b.isNegative &&
    a.name === b.name &&
    a.ownerId === b.ownerId &&
    a.type === b.type
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
    // Editing never changes the icon by itself.
    iconTouched: true,
    isArchived: dto.status === "ARCHIVED",
    isFavorite: dto.isFavorite,
    isNegative: cents < 0,
    name: dto.name,
    ownerId: dto.ownerId,
    type: dto.type,
  };
}

function toCreateParams(
  state: AccountFormState,
  owner: OwnerDTO,
): CreateAccountUseCaseParams {
  return {
    balance: signedBalance(state),
    icon: state.icon,
    // Spec 094: only a favorite is worth sending.
    ...(state.isFavorite ? { isFavorite: true } : {}),
    name: state.name.trim(),
    owner: owner.type,
    ownerId: owner.id,
    status: "ACTIVE",
    type: state.type,
  };
}

// Only changed fields travel; owner/ownerId are immutable (the API answers 400 otherwise).
function toUpdateParams(
  id: string,
  state: AccountFormState,
  initial: AccountFormState,
): AccountChanges {
  const params: AccountChanges = { id };

  if (state.name.trim() !== initial.name.trim()) {
    params.name = state.name.trim();
  }
  if (state.icon !== initial.icon) {
    params.icon = state.icon;
  }
  if (state.type !== initial.type) {
    params.type = state.type;
  }
  if (signedBalance(state) !== signedBalance(initial)) {
    params.balance = signedBalance(state);
  }
  if (state.isArchived !== initial.isArchived) {
    params.status = state.isArchived ? "ARCHIVED" : "ACTIVE";
  }
  // Archiving clears the favorite on the API, so only a stand-alone change is sent (spec 094 FR 16).
  if (state.isFavorite !== initial.isFavorite && !state.isArchived) {
    params.isFavorite = state.isFavorite;
  }

  return params;
}

function validate(
  state: AccountFormState,
  initial?: AccountFormState,
): AccountFormErrors {
  const errors: AccountFormErrors = {};
  const name = state.name.trim();

  if (!name) {
    errors.name = "financial.accounts.nameRequired";
  } else if (name.length > MAX_NAME) {
    errors.name = "financial.accounts.form.errors.nameTooLong";
  }
  if (state.amountCents > MAX_TRANSACTION_CENTS) {
    errors.amount = "financial.accounts.form.errors.balanceTooLarge";
  } else if (
    // An archived account refuses adjustments: say so instead of failing after the tap.
    initial?.isArchived &&
    state.isArchived &&
    signedBalance(state) !== signedBalance(initial)
  ) {
    errors.amount = "financial.errors.accountArchived";
  }

  return errors;
}

// Spec 094 FR 15: an archived account can't be the favorite, so archiving turns the favorite off.
function withArchived(
  state: AccountFormState,
  isArchived: boolean,
): AccountFormState {
  return {
    ...state,
    isArchived,
    isFavorite: isArchived ? false : state.isFavorite,
  };
}

// Spec 101: the icon the user picked stays, even when it equals the default of the type.
function withIcon(state: AccountFormState, icon: string): AccountFormState {
  return { ...state, icon, iconTouched: true };
}

// Spec 101: choosing a type suggests its icon until the user picks one by hand.
function withType(
  state: AccountFormState,
  type: AccountType,
): AccountFormState {
  return {
    ...state,
    icon: state.iconTouched ? state.icon : DEFAULT_ICON_BY_TYPE[type],
    type,
  };
}

export type { AccountChanges, AccountFormErrors, AccountFormState };
export {
  createInitialState,
  isSameState,
  signedBalance,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
  withArchived,
  withIcon,
  withType,
};
