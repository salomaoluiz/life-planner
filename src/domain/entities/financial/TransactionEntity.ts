import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import type { RecurrenceFrequency } from "./RecurrenceEntity";
import type { SplitRefEntity } from "./SplitEntity";
import type { TagRefEntity } from "./TagEntity";
import type { TransferRefEntity } from "./TransferEntity";

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
  // Spec 119: true when the part stores the description of its split.
  descriptionInherited?: boolean;
  earlyPayment?: EarlyPaymentRefEntity;
  excludeFromTotals?: boolean;
  // Spec 107: the module that managed the row (`INVESTMENT`); the row changes only through it.
  externalLock?: string;
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
  projected?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  // Spec 119: the row is a part of a split; `split` is its lookup (absent when the API did not send it).
  split?: SplitRefEntity;
  splitId?: string;
  splitPosition?: number;
  systemKey?: string;
  tags?: TagRefEntity[];
  // Spec 098: the row belongs to a transfer; `transfer` is its lookup (absent when the API did not send it).
  transfer?: TransferRefEntity;
  transferId?: string;
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
  descriptionInherited: boolean;
  earlyPayment?: EarlyPaymentRefEntity;
  excludeFromTotals: boolean;
  // Spec 107: the module that managed the row (`INVESTMENT`); the row changes only through it.
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
  split?: SplitRefEntity;
  splitId?: string;
  splitPosition?: number;
  systemKey?: string;
  tags: TagRefEntity[];
  transfer?: TransferRefEntity;
  transferId?: string;
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
    this.descriptionInherited = params.descriptionInherited ?? false;
    this.notes = params.notes;
    this.earlyPayment = params.earlyPayment;
    this.ownerId = params.ownerId;
    this.paid = params.paid ?? true;
    this.projected = params.projected ?? false;
    this.recurrenceFrequency = params.recurrenceFrequency;
    this.recurrenceId = params.recurrenceId;
    this.excludeFromTotals = params.excludeFromTotals ?? false;
    this.externalLock = params.externalLock;
    this.split = params.split;
    this.splitId = params.splitId;
    this.splitPosition = params.splitPosition;
    this.systemKey = params.systemKey;
    this.tags = params.tags ?? [];
    this.transfer = params.transfer;
    this.transferId = params.transferId;
    this.type = params.type;
    this.value = params.value;
  }
}

export default TransactionEntity;
