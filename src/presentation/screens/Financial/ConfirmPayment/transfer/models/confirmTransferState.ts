import TransferEntity from "@domain/entities/financial/TransferEntity";
import { centsToDecimalString, decimalStringToCents } from "@utils/money";
import { amountInFromRate, parseRate } from "@utils/transferRate";

// Spec 098 FR 7: what "Efetivar transferência" lets the user settle: the amounts and each side's date.
interface ConfirmTransferState {
  amountInCents: number;
  amountOutCents: number;
  dateIn: Date;
  dateOut: Date;
  rateMode: RateMode;
  rateText: string;
}

type RateMode = "AMOUNT_IN" | "RATE";

// Always `paid`; the series occurrence changes only itself; every other field only when it changed.
function buildConfirmParams(
  transfer: TransferEntity,
  state: ConfirmTransferState,
) {
  const initial = initialState(transfer);
  const sameCurrency = isSameCurrency(transfer);
  const amountIn = effectiveAmountInCents(state, sameCurrency);

  return {
    amountIn:
      !sameCurrency && amountIn !== initial.amountInCents
        ? centsToDecimalString(amountIn)
        : undefined,
    amountOut:
      state.amountOutCents !== initial.amountOutCents
        ? centsToDecimalString(state.amountOutCents)
        : undefined,
    dateIn:
      state.dateIn.getTime() !== initial.dateIn.getTime()
        ? state.dateIn.toISOString()
        : undefined,
    dateOut:
      state.dateOut.getTime() !== initial.dateOut.getTime()
        ? state.dateOut.toISOString()
        : undefined,
    id: transfer.id,
    paid: true,
    scope: transfer.recurrenceId ? ("ONLY_THIS" as const) : undefined,
  };
}

// "Efetivar" stays disabled until the amount in is known (spec 098 FR 7).
function canConfirm(state: ConfirmTransferState, sameCurrency: boolean) {
  return (
    state.amountOutCents > 0 && effectiveAmountInCents(state, sameCurrency) > 0
  );
}

// The amount that arrives: the amount out for one currency, else the typed amount or the one the rate gives.
function effectiveAmountInCents(
  state: ConfirmTransferState,
  sameCurrency: boolean,
) {
  if (sameCurrency) {
    return state.amountOutCents;
  }

  return state.rateMode === "RATE"
    ? amountInFromRate(state.amountOutCents, parseRate(state.rateText))
    : state.amountInCents;
}

function initialState(transfer: TransferEntity): ConfirmTransferState {
  return {
    amountInCents: transfer.amountIn
      ? decimalStringToCents(transfer.amountIn)
      : 0,
    amountOutCents: decimalStringToCents(transfer.amountOut),
    dateIn: startOfDay(new Date(transfer.dateIn)),
    dateOut: startOfDay(new Date(transfer.dateOut)),
    rateMode: "AMOUNT_IN",
    rateText: "",
  };
}

function isSameCurrency(transfer: TransferEntity) {
  return transfer.currencyIn === transfer.currencyOut;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export type { ConfirmTransferState, RateMode };
export {
  buildConfirmParams,
  canConfirm,
  effectiveAmountInCents,
  initialState,
  isSameCurrency,
};
