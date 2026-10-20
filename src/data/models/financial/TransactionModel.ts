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

export type TransactionType = "EXPENSE" | "INCOME";

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
  id: string;
  installmentCount?: number;
  installmentNumber?: number;
  installmentPlanId?: string;
  invoiceMonth?: string;
  occurrenceCount?: number;
  occurrenceNumber?: number;
  owner: OwnerType;
  ownerId: string;
  paid?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  systemKey?: string;
  tags?: TagRefModel[];
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
  id: string;
  installmentCount?: number;
  installmentNumber?: number;
  installmentPlanId?: string;
  invoiceMonth?: string;
  occurrenceCount?: number;
  occurrenceNumber?: number;
  owner: OwnerType;
  ownerId: string;
  paid: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  systemKey?: string;
  tags: TagRefModel[];
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
    this.earlyPayment = params.earlyPayment;
    this.occurrenceCount = params.occurrenceCount;
    this.occurrenceNumber = params.occurrenceNumber;
    this.owner = params.owner;
    this.id = params.id;
    this.ownerId = params.ownerId;
    this.paid = params.paid ?? true;
    this.recurrenceFrequency = params.recurrenceFrequency;
    this.recurrenceId = params.recurrenceId;
    this.excludeFromTotals = params.excludeFromTotals ?? false;
    this.systemKey = params.systemKey;
    this.tags = params.tags ?? [];
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
      id: data.id as string,
      installmentCount: (data.installmentCount as null | number) ?? undefined,
      installmentNumber: (data.installmentNumber as null | number) ?? undefined,
      installmentPlanId: (data.installmentPlanId as null | string) ?? undefined,
      invoiceMonth: (data.invoiceMonth as null | string) ?? undefined,
      occurrenceCount: (data.occurrenceCount as null | number) ?? undefined,
      occurrenceNumber: (data.occurrenceNumber as null | number) ?? undefined,
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      // An API without spec 033 sends no status: every row then counts as paid.
      paid: (data.paid as boolean | undefined) ?? true,
      recurrenceFrequency:
        (data.recurrenceFrequency as null | RecurrenceFrequency) ?? undefined,
      recurrenceId: (data.recurrenceId as null | string) ?? undefined,
      systemKey: category?.systemKey ?? undefined,
      tags: tagRefsFromJSON(data.tags),
      type: data.type as TransactionType,
      value: centsToDecimalString(Number(data.value)),
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
      occurrenceCount: this.occurrenceCount ?? null,
      occurrenceNumber: this.occurrenceNumber ?? null,
      owner: this.owner,
      ownerId: this.ownerId,
      paid: this.paid,
      recurrenceFrequency: this.recurrenceFrequency ?? null,
      recurrenceId: this.recurrenceId ?? null,
      tags: this.tags,
      type: this.type,
      value: decimalStringToCents(this.value),
    };
  }
}

export default TransactionModel;
