import {
  CurrencyCode,
  toCurrencyCode,
} from "@domain/entities/financial/Currency";

import { calendarDateToIso } from "./calendarDate";
import { centsToDecimalString } from "./money";
import TransactionModel, { TransactionLookups } from "./TransactionModel";

export interface TransferRateModel {
  base: "IN" | "OUT";
  value: number;
}

// `{ item, rows, lookups }`: the response of create, update and by id.
export interface TransferWithRows {
  item: Record<string, unknown>;
  lookups: Partial<TransactionLookups>;
  rows: Record<string, unknown>[];
}

interface ITransferModel {
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
  rate?: TransferRateModel;
  recurrenceId?: string;
  toAccountId?: string;
}

class TransferModel implements ITransferModel {
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
  rate?: TransferRateModel;
  recurrenceId?: string;
  toAccountId?: string;

  constructor(params: ITransferModel) {
    this.amountIn = params.amountIn;
    this.amountOut = params.amountOut;
    this.currencyIn = params.currencyIn;
    this.currencyOut = params.currencyOut;
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

  static fromJSON(data: Record<string, unknown>): TransferModel {
    const amountIn = data.amountIn as null | number | undefined;
    const fee = data.fee as null | number | undefined;

    return new TransferModel({
      amountIn:
        amountIn === null || amountIn === undefined
          ? undefined
          : centsToDecimalString(amountIn),
      amountOut: centsToDecimalString(Number(data.amountOut)),
      currencyIn: toCurrencyCode(data.currencyIn),
      currencyOut: toCurrencyCode(data.currencyOut),
      dateIn: calendarDateToIso(data.dateIn as string),
      dateOut: calendarDateToIso(data.dateOut as string),
      description: data.description as string,
      fee:
        fee === null || fee === undefined
          ? undefined
          : centsToDecimalString(fee),
      fromAccountId: (data.fromAccountId as null | string) ?? undefined,
      id: data.id as string,
      notes: (data.notes as null | string) ?? undefined,
      occurrenceNumber: (data.occurrenceNumber as null | number) ?? undefined,
      paid: data.paid === true,
      rate: (data.rate as TransferRateModel | undefined) ?? undefined,
      recurrenceId: (data.recurrenceId as null | string) ?? undefined,
      toAccountId: (data.toAccountId as null | string) ?? undefined,
    });
  }

  static fromResponse(response: TransferWithRows): {
    rows: TransactionModel[];
    transfer: TransferModel;
  } {
    return {
      rows: response.rows.map((row) =>
        TransactionModel.fromLeanJSON(row, response.lookups),
      ),
      transfer: TransferModel.fromJSON(response.item),
    };
  }
}

export default TransferModel;
