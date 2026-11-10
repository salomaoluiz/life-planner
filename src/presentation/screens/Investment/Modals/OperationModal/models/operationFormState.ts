import { todayCalendarDate } from "@data/models/financial/calendarDate";
import {
  InvestmentFeeKind,
  InvestmentOperationType,
  MAX_FEES_PER_OPERATION,
} from "@domain/entities/investment/enums";
import { InvestmentOperation } from "@domain/entities/investment/InvestmentEntities";
import {
  CreateInvestmentOperationParams,
  UpdateInvestmentOperationParams,
} from "@domain/repositories/investment";
import { TranslationKeys } from "@presentation/i18n/types";
import { parseDecimal, ZERO } from "@utils/decimal";

interface FeeRow {
  amountCents: number;
  description: string;
  key: string;
  kind: InvestmentFeeKind;
}

interface OperationFormErrors {
  account?: TranslationKeys;
  feeDescriptions: Record<string, TranslationKeys>;
  fxRate?: TranslationKeys;
  quantity?: TranslationKeys;
  unitPrice?: TranslationKeys;
}

interface OperationFormState {
  accountId?: string;
  date: Date;
  fees: FeeRow[];
  // BRL per USD of a foreign currency asset (decimal text); empty = the API uses the rate of the date.
  fxRate: string;
  generate: boolean;
  quantity: string;
  type: InvestmentOperationType;
  unitPrice: string;
}

let feeCounter = 0;

function addFee(state: OperationFormState): OperationFormState {
  if (state.fees.length >= MAX_FEES_PER_OPERATION) {
    return state;
  }

  return {
    ...state,
    fees: [
      ...state.fees,
      {
        amountCents: 0,
        description: "",
        key: newFeeKey(),
        kind: InvestmentFeeKind.BROKERAGE,
      },
    ],
  };
}

function createInitialState(accountId?: string): OperationFormState {
  return {
    accountId,
    date: new Date(),
    fees: [],
    fxRate: "",
    generate: true,
    quantity: "",
    type: InvestmentOperationType.BUY,
    unitPrice: "",
  };
}

function feeSignature(fee: FeeRow) {
  return [fee.kind, fee.amountCents, fee.description];
}

function hasErrors(errors: OperationFormErrors): boolean {
  return (
    !!errors.account ||
    !!errors.fxRate ||
    !!errors.quantity ||
    !!errors.unitPrice ||
    Object.keys(errors.feeDescriptions).length > 0
  );
}

function isSameState(a: OperationFormState, b: OperationFormState) {
  return (
    a.accountId === b.accountId &&
    todayCalendarDate(a.date) === todayCalendarDate(b.date) &&
    a.fxRate === b.fxRate &&
    a.generate === b.generate &&
    a.quantity === b.quantity &&
    a.type === b.type &&
    a.unitPrice === b.unitPrice &&
    JSON.stringify(a.fees.map(feeSignature)) ===
      JSON.stringify(b.fees.map(feeSignature))
  );
}

function newFeeKey(): string {
  feeCounter += 1;

  return `fee-${feeCounter}`;
}

function removeFee(state: OperationFormState, key: string): OperationFormState {
  return { ...state, fees: state.fees.filter((fee) => fee.key !== key) };
}

function stateFromOperation(
  operation: InvestmentOperation,
): OperationFormState {
  const [year, month, day] = operation.date.split("-").map(Number);

  return {
    accountId: operation.accountId ?? undefined,
    date: new Date(year, month - 1, day),
    fees: operation.fees.map((fee) => ({
      amountCents: fee.amount,
      description: fee.description ?? "",
      key: newFeeKey(),
      kind: fee.kind,
    })),
    fxRate: operation.fxRate ?? "",
    generate: operation.generateTransaction,
    quantity: operation.quantity,
    type: operation.type,
    unitPrice: operation.unitPrice,
  };
}

function toApiFees(state: OperationFormState) {
  return state.fees.map((fee) => ({
    amount: fee.amountCents,
    description:
      fee.kind === InvestmentFeeKind.OTHER ? fee.description.trim() : undefined,
    kind: fee.kind,
  }));
}

function toCreateParams(
  assetId: string,
  state: OperationFormState,
): CreateInvestmentOperationParams {
  return {
    accountId: state.generate ? state.accountId : undefined,
    assetId,
    date: todayCalendarDate(state.date),
    fees: toApiFees(state),
    fxRate: state.fxRate.trim() === "" ? undefined : state.fxRate,
    generateTransaction: state.generate,
    quantity: state.quantity,
    type: state.type,
    unitPrice: state.unitPrice,
  };
}

function toUpdateParams(
  id: string,
  state: OperationFormState,
): UpdateInvestmentOperationParams {
  return {
    accountId: state.generate ? (state.accountId ?? null) : null,
    date: todayCalendarDate(state.date),
    fees: toApiFees(state),
    fxRate: state.fxRate.trim() === "" ? undefined : state.fxRate,
    generateTransaction: state.generate,
    id,
    quantity: state.quantity,
    unitPrice: state.unitPrice,
  };
}

function updateFee(
  state: OperationFormState,
  key: string,
  changes: Partial<Omit<FeeRow, "key">>,
): OperationFormState {
  return {
    ...state,
    fees: state.fees.map((fee) =>
      fee.key === key ? { ...fee, ...changes } : fee,
    ),
  };
}

function validate(state: OperationFormState): OperationFormErrors {
  const errors: OperationFormErrors = { feeDescriptions: {} };
  const quantity = parseDecimal(state.quantity);
  const price = parseDecimal(state.unitPrice);

  if (quantity === null || quantity <= ZERO) {
    errors.quantity = "investment.form.operation.quantityInvalid";
  }
  if (price === null || price <= ZERO) {
    errors.unitPrice = "investment.form.operation.unitPriceInvalid";
  }
  if (state.fxRate.trim() !== "") {
    const rate = parseDecimal(state.fxRate);

    if (rate === null || rate <= ZERO) {
      errors.fxRate = "investment.form.operation.fxRateInvalid";
    }
  }
  if (state.generate && !state.accountId) {
    errors.account = "investment.form.operation.accountRequired";
  }
  for (const fee of state.fees) {
    if (fee.kind === InvestmentFeeKind.OTHER && fee.description.trim() === "") {
      errors.feeDescriptions[fee.key] =
        "investment.form.operation.feeDescriptionRequired";
    }
  }

  return errors;
}

export type { FeeRow, OperationFormErrors, OperationFormState };
export {
  addFee,
  createInitialState,
  hasErrors,
  isSameState,
  removeFee,
  stateFromOperation,
  toCreateParams,
  toUpdateParams,
  updateFee,
  validate,
};
