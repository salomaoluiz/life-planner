import AccountDTO from "@application/dto/financial/AccountDTO";
import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateCreditCardUseCaseParams } from "@application/useCases/cases/financial/creditCards/createCreditCardUseCase";
import { UpdateCreditCardUseCaseParams } from "@application/useCases/cases/financial/creditCards/updateCreditCardUseCase";
import { DEFAULT_CARD_COLOR } from "@presentation/constants/cardColors";
import { TranslationKeys } from "@presentation/i18n/types";
import { MAX_TRANSACTION_CENTS } from "@utils/money";

const MAX_TITLE = 60;
const LAST_DIGITS = /^\d{4}$/;

type CardFormErrors = Partial<
  Record<
    "closingDay" | "dueDay" | "lastDigits" | "limit" | "title",
    TranslationKeys
  >
>;

interface CardFormState {
  brand: string;
  closingDay: string;
  dueDay: string;
  isArchived: boolean;
  lastDigits: string;
  limitCents: number;
  ownerId: string;
  // Account that pays the invoice; "" = none (spec 035).
  paymentAccountId: string;
  paymentDay: string;
  tint: string;
  title: string;
}

interface PaymentAccountOption {
  archived?: boolean;
  label?: string;
  labelKey?: TranslationKeys;
  value: string;
}

function createInitialState(params: { ownerId: string }): CardFormState {
  return {
    brand: "VISA",
    closingDay: "",
    dueDay: "",
    isArchived: false,
    lastDigits: "",
    limitCents: 0,
    ownerId: params.ownerId,
    paymentAccountId: "",
    paymentDay: "",
    tint: DEFAULT_CARD_COLOR,
    title: "",
  };
}

// FR 16/17 on the nominal days: a day after the closing day falls in the same month, otherwise in the next.
// A payment that lands after the due date only warns, it never blocks saving (FR 23).
function isPaymentAfterDue(state: CardFormState): boolean {
  const closing = Number(state.closingDay);
  const due = Number(state.dueDay);
  const payment = state.paymentDay === "" ? due : Number(state.paymentDay);

  if (!closing || !due || !payment) {
    return false;
  }

  const dueMonth = due > closing ? 0 : 1;
  const paymentMonth = payment > closing ? 0 : 1;

  return (
    paymentMonth > dueMonth || (paymentMonth === dueMonth && payment > due)
  );
}

function isSameState(a: CardFormState, b: CardFormState) {
  return (
    a.brand === b.brand &&
    a.closingDay === b.closingDay &&
    a.dueDay === b.dueDay &&
    a.isArchived === b.isArchived &&
    a.lastDigits === b.lastDigits &&
    a.limitCents === b.limitCents &&
    a.ownerId === b.ownerId &&
    a.paymentAccountId === b.paymentAccountId &&
    a.paymentDay === b.paymentDay &&
    a.tint === b.tint &&
    a.title === b.title
  );
}

// "None", the active accounts, and the currently linked one when it is archived or not visible to the reader.
function paymentAccountOptions(
  accounts: AccountDTO[],
  selectedId: string,
): PaymentAccountOption[] {
  const options: PaymentAccountOption[] = [
    { labelKey: "financial.cardForm.paymentAccountNone", value: "" },
    ...accounts
      .filter((account) => account.status === "ACTIVE")
      .map((account) => ({ label: account.name, value: account.id })),
  ];

  if (selectedId !== "" && !options.some((item) => item.value === selectedId)) {
    const linked = accounts.find((account) => account.id === selectedId);

    options.push(
      linked
        ? { archived: true, label: linked.name, value: linked.id }
        : {
            labelKey: "financial.cardForm.paymentAccountOther",
            value: selectedId,
          },
    );
  }

  return options;
}

function stateFromDto(dto: CreditCardDTO): CardFormState {
  return {
    brand: dto.brand,
    closingDay: String(dto.closingDay),
    dueDay: String(dto.dueDay),
    isArchived: dto.status === "ARCHIVED",
    lastDigits: dto.lastDigits ?? "",
    limitCents: dto.limit,
    ownerId: dto.ownerId,
    paymentAccountId: dto.paymentAccountId ?? "",
    paymentDay: dto.paymentDay === undefined ? "" : String(dto.paymentDay),
    tint: dto.color,
    title: dto.title,
  };
}

function toCreateParams(
  state: CardFormState,
  owner: OwnerDTO,
): CreateCreditCardUseCaseParams {
  // Computed key: the screen guardrail forbids a `color` property key (style props), this is data.
  return {
    brand: state.brand,
    closingDay: Number(state.closingDay),
    ["color"]: state.tint,
    dueDay: Number(state.dueDay),
    lastDigits: state.lastDigits === "" ? undefined : state.lastDigits,
    limit: state.limitCents,
    owner: owner.type,
    ownerId: owner.id,
    paymentAccountId:
      state.paymentAccountId === "" ? undefined : state.paymentAccountId,
    paymentDay: state.paymentDay === "" ? undefined : Number(state.paymentDay),
    title: state.title.trim(),
  };
}

// Only changed fields travel. Clearing an optional field sends null; the owner moves with its type.
function toUpdateParams(
  id: string,
  state: CardFormState,
  initial: CardFormState,
  owner: OwnerDTO,
): UpdateCreditCardUseCaseParams {
  const params: UpdateCreditCardUseCaseParams = { id };

  if (state.title.trim() !== initial.title.trim()) {
    params.title = state.title.trim();
  }
  if (state.limitCents !== initial.limitCents) {
    params.limit = state.limitCents;
  }
  if (state.brand !== initial.brand) {
    params.brand = state.brand;
  }
  if (state.closingDay !== initial.closingDay) {
    params.closingDay = Number(state.closingDay);
  }
  if (state.dueDay !== initial.dueDay) {
    params.dueDay = Number(state.dueDay);
  }
  if (state.paymentDay !== initial.paymentDay) {
    params.paymentDay =
      state.paymentDay === "" ? null : Number(state.paymentDay);
  }
  if (state.paymentAccountId !== initial.paymentAccountId) {
    params.paymentAccountId =
      state.paymentAccountId === "" ? null : state.paymentAccountId;
  }
  if (state.lastDigits !== initial.lastDigits) {
    params.lastDigits = state.lastDigits === "" ? null : state.lastDigits;
  }
  if (state.tint !== initial.tint) {
    params.color = state.tint;
  }
  if (state.ownerId !== initial.ownerId) {
    params.owner = owner.type;
    params.ownerId = owner.id;
  }
  if (state.isArchived !== initial.isArchived) {
    params.status = state.isArchived ? "ARCHIVED" : "ACTIVE";
  }

  return params;
}

function validate(state: CardFormState): CardFormErrors {
  const errors: CardFormErrors = {};
  const title = state.title.trim();

  if (!title) {
    errors.title = "financial.cardForm.errors.titleRequired";
  } else if (title.length > MAX_TITLE) {
    errors.title = "financial.cardForm.errors.titleTooLong";
  }
  if (state.limitCents < 1) {
    errors.limit = "financial.cardForm.errors.limitRequired";
  } else if (state.limitCents > MAX_TRANSACTION_CENTS) {
    errors.limit = "financial.cardForm.errors.limitTooLarge";
  }
  if (state.lastDigits !== "" && !LAST_DIGITS.test(state.lastDigits)) {
    errors.lastDigits = "financial.cardForm.errors.lastDigitsInvalid";
  }
  if (state.closingDay === "") {
    errors.closingDay = "financial.cardForm.errors.dayRequired";
  }
  if (state.dueDay === "") {
    errors.dueDay = "financial.cardForm.errors.dayRequired";
  }

  return errors;
}

export type { CardFormErrors, CardFormState, PaymentAccountOption };
export {
  createInitialState,
  isPaymentAfterDue,
  isSameState,
  paymentAccountOptions,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
};
