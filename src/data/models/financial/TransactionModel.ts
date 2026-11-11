import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  toCurrencyCode,
} from "@domain/entities/financial/Currency";

import { calendarDateToIso, isoToCalendarDate } from "./calendarDate";
import { centsToDecimalString, decimalStringToCents } from "./money";
import { TagRefModel, tagRefsFromJSON } from "./TagModel";

export interface EarlyPaymentRefModel {
  creditCardId: string;
  id: string;
  invoiceMonth: string;
}

export type OwnerType = "FAMILY" | "USER";

export type RecurrenceFrequency = "BIWEEKLY" | "MONTHLY" | "WEEKLY" | "YEARLY";

export interface TransactionLookups {
  categories: Record<
    string,
    { excludeFromTotals?: boolean; name?: string; systemKey?: string }
  >;
  tags: Record<string, { name: string }>;
  // Spec 098: only present when a row of the response belongs to a transfer (amounts in cents).
  transfers?: Record<string, Record<string, unknown>>;
}

export type TransactionType = "EXPENSE" | "INCOME";

// `{ item, lookups }`: the response of by id, create and update.
export interface TransactionWithLookups {
  item: Record<string, unknown>;
  lookups: TransactionLookups;
}

// Spec 079: the entities a lean transaction response references, once each, by id.
// Spec 098: a transfer a row belongs to; the amounts are decimal text, `counterpartHidden` marks the side the caller cannot read.
export interface TransferRefModel {
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

interface ITransactionModel {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  currency?: CurrencyCode;
  date: string;
  description: string;
  earlyPayment?: EarlyPaymentRefModel;
  excludeFromTotals?: boolean;
  externalLock?: string;
  id: string;
  installmentCount?: number;
  installmentNumber?: number;
  installmentPlanId?: string;
  invoiceMonth?: string;
  notes?: string;
  occurrenceCount?: number;
  occurrenceNumber?: number;
  owner: OwnerType;
  ownerId: string;
  paid?: boolean;
  projected?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  systemKey?: string;
  tags?: TagRefModel[];
  transfer?: TransferRefModel;
  transferId?: string;
  type: TransactionType;
  value: string;
}

class TransactionModel implements ITransactionModel {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  currency: CurrencyCode;
  date: string;
  description: string;
  earlyPayment?: EarlyPaymentRefModel;
  excludeFromTotals: boolean;
  externalLock?: string;
  id: string;
  installmentCount?: number;
  installmentNumber?: number;
  installmentPlanId?: string;
  invoiceMonth?: string;
  notes?: string;
  occurrenceCount?: number;
  occurrenceNumber?: number;
  owner: OwnerType;
  ownerId: string;
  paid: boolean;
  // Spec 096: a card purchase not charged yet.
  projected: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  systemKey?: string;
  tags: TagRefModel[];
  transfer?: TransferRefModel;
  transferId?: string;
  type: TransactionType;
  value: string;

  constructor(params: ITransactionModel) {
    this.accountId = params.accountId;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.date = params.date;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.installmentCount = params.installmentCount;
    this.installmentNumber = params.installmentNumber;
    this.installmentPlanId = params.installmentPlanId;
    this.invoiceMonth = params.invoiceMonth;
    this.description = params.description;
    this.notes = params.notes;
    this.earlyPayment = params.earlyPayment;
    this.occurrenceCount = params.occurrenceCount;
    this.occurrenceNumber = params.occurrenceNumber;
    this.owner = params.owner;
    this.id = params.id;
    this.ownerId = params.ownerId;
    this.paid = params.paid ?? true;
    this.projected = params.projected ?? false;
    this.recurrenceFrequency = params.recurrenceFrequency;
    this.recurrenceId = params.recurrenceId;
    this.excludeFromTotals = params.excludeFromTotals ?? false;
    this.externalLock = params.externalLock;
    this.systemKey = params.systemKey;
    this.tags = params.tags ?? [];
    this.transfer = params.transfer;
    this.transferId = params.transferId;
    this.type = params.type;
    this.value = params.value;
  }

  static fromJSON(data: Record<string, unknown>): TransactionModel {
    const category = data.category as
      | undefined
      | {
          excludeFromTotals?: boolean;
          name?: string;
          systemKey?: null | string;
        };

    return new TransactionModel({
      accountId: (data.accountId as null | string) ?? undefined,
      category: category?.name ?? "",
      categoryId: data.categoryId as string,
      creditCardId: (data.creditCardId as null | string) ?? undefined,
      currency: toCurrencyCode(data.currency),
      date: calendarDateToIso(data.date as string),
      description: data.description as string,
      earlyPayment:
        (data.earlyPayment as EarlyPaymentRefModel | null) ?? undefined,
      excludeFromTotals: category?.excludeFromTotals === true,
      externalLock: (data.externalLock as null | string) ?? undefined,
      id: data.id as string,
      installmentCount: (data.installmentCount as null | number) ?? undefined,
      installmentNumber: (data.installmentNumber as null | number) ?? undefined,
      installmentPlanId: (data.installmentPlanId as null | string) ?? undefined,
      invoiceMonth: (data.invoiceMonth as null | string) ?? undefined,
      notes: (data.notes as null | string) ?? undefined,
      occurrenceCount: (data.occurrenceCount as null | number) ?? undefined,
      occurrenceNumber: (data.occurrenceNumber as null | number) ?? undefined,
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      // An API without spec 033 sends no status: every row then counts as paid.
      paid: (data.paid as boolean | undefined) ?? true,
      projected: data.projected === true,
      recurrenceFrequency:
        (data.recurrenceFrequency as null | RecurrenceFrequency) ?? undefined,
      recurrenceId: (data.recurrenceId as null | string) ?? undefined,
      systemKey: category?.systemKey ?? undefined,
      tags: tagRefsFromJSON(data.tags),
      transfer: (data.transfer as TransferRefModel | undefined) ?? undefined,
      transferId: (data.transferId as null | string) ?? undefined,
      type: data.type as TransactionType,
      value: centsToDecimalString(Number(data.value)),
    });
  }

  // Spec 079: a lean item (ids only, absent fields) joined with the response `lookups`. It rebuilds the nested
  // shape `fromJSON` and the repository cache read, so nothing downstream changes.
  static fromLeanJSON(
    item: Record<string, unknown>,
    lookups: Partial<TransactionLookups>,
  ): TransactionModel {
    const category = lookups.categories?.[item.categoryId as string];
    const tagIds = (item.tagIds as string[] | undefined) ?? [];

    return TransactionModel.fromJSON({
      ...item,
      category: category && {
        excludeFromTotals: category.excludeFromTotals,
        name: category.name,
        systemKey: category.systemKey,
      },
      tags: tagIds.map((id) => ({ id, name: lookups.tags?.[id]?.name ?? "" })),
      transfer: toTransferRef(lookups.transfers?.[item.transferId as string]),
    });
  }

  // Same shape as the API: also what the repository cache stores.
  toJSON() {
    return {
      accountId: this.accountId ?? null,
      category: {
        excludeFromTotals: this.excludeFromTotals,
        name: this.category,
        systemKey: this.systemKey ?? null,
      },
      categoryId: this.categoryId,
      creditCardId: this.creditCardId ?? null,
      currency: this.currency,
      date: isoToCalendarDate(this.date),
      description: this.description,
      earlyPayment: this.earlyPayment ?? null,
      id: this.id,
      installmentCount: this.installmentCount ?? null,
      installmentNumber: this.installmentNumber ?? null,
      installmentPlanId: this.installmentPlanId ?? null,
      invoiceMonth: this.invoiceMonth ?? null,
      notes: this.notes ?? null,
      occurrenceCount: this.occurrenceCount ?? null,
      occurrenceNumber: this.occurrenceNumber ?? null,
      owner: this.owner,
      ownerId: this.ownerId,
      paid: this.paid,
      // Lean like the API: only a projected row carries the flag.
      ...(this.projected ? { projected: true } : {}),
      recurrenceFrequency: this.recurrenceFrequency ?? null,
      recurrenceId: this.recurrenceId ?? null,
      tags: this.tags,
      // Spec 098: kept so a cached row still draws its transfer.
      ...(this.transfer ? { transfer: this.transfer } : {}),
      ...(this.externalLock ? { externalLock: this.externalLock } : {}),
      ...(this.transferId ? { transferId: this.transferId } : {}),
      type: this.type,
      value: decimalStringToCents(this.value),
    };
  }
}

function optionalCents(value: unknown) {
  return typeof value === "number" ? centsToDecimalString(value) : undefined;
}

// A transfer lookup of the API (cents, calendar days) as the row model keeps it (decimal text, ISO instants).
function toTransferRef(
  lookup?: Record<string, unknown>,
): TransferRefModel | undefined {
  if (!lookup) {
    return undefined;
  }

  return {
    amountIn: optionalCents(lookup.amountIn),
    amountOut: optionalCents(lookup.amountOut),
    counterpartHidden: lookup.counterpartHidden === true,
    currencyIn: toCurrencyCode(lookup.currencyIn),
    currencyOut: toCurrencyCode(lookup.currencyOut),
    dateIn: calendarDateToIso(lookup.dateIn as string),
    dateOut: calendarDateToIso(lookup.dateOut as string),
    feeTransactionId: (lookup.feeTransactionId as string) ?? undefined,
    fromAccountId: (lookup.fromAccountId as string) ?? undefined,
    recurrenceId: (lookup.recurrenceId as string) ?? undefined,
    toAccountId: (lookup.toAccountId as string) ?? undefined,
  };
}

export default TransactionModel;
