import {
  CurrencyCode,
  toCurrencyCode,
} from "@domain/entities/financial/Currency";

import { calendarDateToIso } from "./calendarDate";
import { centsToDecimalString } from "./money";
import TransactionModel, {
  OwnerType,
  TransactionLookups,
  TransactionType,
} from "./TransactionModel";

// Update answers the split OR, when one part is left, the ordinary transaction (`dissolved: true`).
export interface SplitUpdateResponse extends SplitWithLookups {
  dissolved?: boolean;
}

// `{ item, lookups }`: the response of create, update (full) and by id; `item.parts` are lean rows.
export interface SplitWithLookups {
  item: Record<string, unknown>;
  lookups: Partial<TransactionLookups>;
}

interface ISplitModel {
  accountId?: string;
  creditCardId?: string;
  currency: CurrencyCode;
  date: string;
  description: string;
  id: string;
  invoiceMonth?: string;
  notes?: string;
  occurrenceNumber?: number;
  owner: OwnerType;
  ownerId: string;
  paid?: boolean;
  recurrenceId?: string;
  total: string;
  type: TransactionType;
}

class SplitModel implements ISplitModel {
  accountId?: string;
  creditCardId?: string;
  currency: CurrencyCode;
  date: string;
  description: string;
  id: string;
  invoiceMonth?: string;
  notes?: string;
  occurrenceNumber?: number;
  owner: OwnerType;
  ownerId: string;
  paid?: boolean;
  recurrenceId?: string;
  total: string;
  type: TransactionType;

  constructor(params: ISplitModel) {
    this.accountId = params.accountId;
    this.creditCardId = params.creditCardId;
    this.currency = params.currency;
    this.date = params.date;
    this.description = params.description;
    this.id = params.id;
    this.invoiceMonth = params.invoiceMonth;
    this.notes = params.notes;
    this.occurrenceNumber = params.occurrenceNumber;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.paid = params.paid;
    this.recurrenceId = params.recurrenceId;
    this.total = params.total;
    this.type = params.type;
  }

  static fromJSON(data: Record<string, unknown>): SplitModel {
    return new SplitModel({
      accountId: (data.accountId as null | string) ?? undefined,
      creditCardId: (data.creditCardId as null | string) ?? undefined,
      currency: toCurrencyCode(data.currency),
      date: calendarDateToIso(data.date as string),
      description: data.description as string,
      id: data.id as string,
      invoiceMonth: (data.invoiceMonth as null | string) ?? undefined,
      notes: (data.notes as null | string) ?? undefined,
      occurrenceNumber: (data.occurrenceNumber as null | number) ?? undefined,
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      paid: (data.paid as boolean | undefined) ?? undefined,
      recurrenceId: (data.recurrenceId as null | string) ?? undefined,
      total: centsToDecimalString(Number(data.total)),
      type: data.type as TransactionType,
    });
  }

  static fromResponse(response: SplitWithLookups): {
    parts: TransactionModel[];
    split: SplitModel;
  } {
    const parts = (response.item.parts as Record<string, unknown>[]) ?? [];

    return {
      parts: parts.map((part) =>
        TransactionModel.fromLeanJSON(part, response.lookups),
      ),
      split: SplitModel.fromJSON(response.item),
    };
  }

  // The update answer: the split with its parts, or the ordinary row that remains.
  static fromUpdateResponse(response: SplitUpdateResponse): {
    dissolved?: TransactionModel;
    result?: { parts: TransactionModel[]; split: SplitModel };
  } {
    if (response.dissolved) {
      return {
        dissolved: TransactionModel.fromLeanJSON(
          response.item,
          response.lookups,
        ),
      };
    }

    return { result: SplitModel.fromResponse(response) };
  }
}

export default SplitModel;
