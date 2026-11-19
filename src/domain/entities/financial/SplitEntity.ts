import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import type TransactionEntity from "@domain/entities/financial/TransactionEntity";
import type { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

// What a list row needs to group the part rows of a split (spec 119 FR 27-28): amounts are decimal text, `matched*`
// follow the filters of the request.
export interface SplitRefEntity {
  description: string;
  matchedCount: number;
  matchedTotal: string;
  notes?: string;
  occurrenceNumber?: number;
  paid?: boolean;
  partCount: number;
  recurrenceId?: string;
  total: string;
  type: TransactionType;
}

// The split and the part rows it wrote, already joined with their lookups.
export interface SplitResultEntity {
  parts: TransactionEntity[];
  split: SplitEntity;
}

// One part left: the split is gone and the row is an ordinary transaction (spec 119 FR 22).
export interface SplitUpdateResultEntity {
  dissolved?: TransactionEntity;
  result?: SplitResultEntity;
}

interface ISplitEntity {
  accountId?: string;
  creditCardId?: string;
  currency?: CurrencyCode;
  // ISO instant of the calendar day.
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
  // Decimal text of the magnitude of the net of the parts, and its direction.
  total: string;
  type: TransactionType;
}

// Spec 119: the header of a split; its parts come with it as ordinary rows (`splitId`).
class SplitEntity {
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

  constructor(params: ISplitEntity) {
    this.accountId = params.accountId;
    this.creditCardId = params.creditCardId;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
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
}

export default SplitEntity;
