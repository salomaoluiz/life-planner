import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";

import type { RecurrenceFrequency } from "./RecurrenceEntity";

// Which side is the unit of the exchange rate: IN reads "1 <currency in> = value <currency out>".
export type TransferRateBase = "IN" | "OUT";

export interface TransferRateEntity {
  base: TransferRateBase;
  value: number;
}

// Series options of a new transfer (spec 098 FR 8); `endDate` is an ISO instant.
export interface TransferRecurrenceEntity {
  endDate?: string;
  frequency: RecurrenceFrequency;
}

// What a list row needs to draw a transfer (spec 098 FR 5): the other side may be hidden when the caller cannot read it.
export interface TransferRefEntity {
  amountIn?: string;
  amountOut?: string;
  counterpartHidden: boolean;
  currencyIn: CurrencyCode;
  currencyOut: CurrencyCode;
  dateIn: string;
  dateOut: string;
  feeTransactionId?: string;
  fromAccountId?: string;
  recurrenceId?: string;
  toAccountId?: string;
}

interface ITransferEntity {
  // Decimal text of the amount that arrived; absent while it is still to be informed (series, other currency).
  amountIn?: string;
  amountOut: string;
  currencyIn?: CurrencyCode;
  currencyOut?: CurrencyCode;
  // ISO instants of the calendar days.
  dateIn: string;
  dateOut: string;
  description: string;
  fee?: string;
  fromAccountId?: string;
  id: string;
  notes?: string;
  occurrenceNumber?: number;
  paid: boolean;
  rate?: TransferRateEntity;
  recurrenceId?: string;
  toAccountId?: string;
}

// Spec 098: one movement between two accounts; its rows come from the transactions list with `transferId`.
class TransferEntity {
  amountIn?: string;
  amountOut: string;
  currencyIn: CurrencyCode;
  currencyOut: CurrencyCode;
  dateIn: string;
  dateOut: string;
  description: string;
  fee?: string;
  fromAccountId?: string;
  id: string;
  notes?: string;
  occurrenceNumber?: number;
  paid: boolean;
  rate?: TransferRateEntity;
  recurrenceId?: string;
  toAccountId?: string;

  constructor(params: ITransferEntity) {
    this.amountIn = params.amountIn;
    this.amountOut = params.amountOut;
    this.currencyIn = params.currencyIn ?? DEFAULT_CURRENCY;
    this.currencyOut = params.currencyOut ?? DEFAULT_CURRENCY;
    this.dateIn = params.dateIn;
    this.dateOut = params.dateOut;
    this.description = params.description;
    this.fee = params.fee;
    this.fromAccountId = params.fromAccountId;
    this.id = params.id;
    this.notes = params.notes;
    this.occurrenceNumber = params.occurrenceNumber;
    this.paid = params.paid;
    this.rate = params.rate;
    this.recurrenceId = params.recurrenceId;
    this.toAccountId = params.toAccountId;
  }
}

export default TransferEntity;
