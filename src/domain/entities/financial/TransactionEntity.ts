import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import type { RecurrenceFrequency } from "./RecurrenceEntity";
import type { TagRefEntity } from "./TagEntity";

export enum TransactionType {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
}

// The early payment (card row) an account debit row belongs to (spec 032 FR 35).
export interface EarlyPaymentRefEntity {
  creditCardId: string;
  id: string;
  // `YYYY-MM`
  invoiceMonth: string;
}

// Key of the system category that marks a balance adjustment (spec 028).
export const BALANCE_ADJUSTMENT = "BALANCE_ADJUSTMENT";

interface ITransactionEntity {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  currency?: CurrencyCode;
  date: string;
  description: string;
  earlyPayment?: EarlyPaymentRefEntity;
  excludeFromTotals?: boolean;
  id: string;
  installmentCount?: number;
  installmentNumber?: number;
  installmentPlanId?: string;
  invoiceMonth?: string;
  notes?: string;
  // Position in a recurring series, its total (absent without an end date), series id and frequency (spec 034).
  occurrenceCount?: number;
  occurrenceNumber?: number;
  owner: OwnerType;
  ownerId: string;
  // Account rows: stored status. Card rows: whether the invoice is paid (spec 033).
  paid?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  systemKey?: string;
  tags?: TagRefEntity[];
  type: TransactionType;
  value: string;
}

class TransactionEntity {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  currency: CurrencyCode;
  date: string;
  description: string;
  earlyPayment?: EarlyPaymentRefEntity;
  excludeFromTotals: boolean;
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
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  systemKey?: string;
  tags: TagRefEntity[];
  type: TransactionType;
  value: string;

  constructor(params: ITransactionEntity) {
    this.accountId = params.accountId;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.installmentCount = params.installmentCount;
    this.installmentNumber = params.installmentNumber;
    this.installmentPlanId = params.installmentPlanId;
    this.invoiceMonth = params.invoiceMonth;
    this.date = params.date;
    this.id = params.id;
    this.occurrenceCount = params.occurrenceCount;
    this.occurrenceNumber = params.occurrenceNumber;
    this.owner = params.owner;
    this.description = params.description;
    this.notes = params.notes;
    this.earlyPayment = params.earlyPayment;
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
}

export default TransactionEntity;
