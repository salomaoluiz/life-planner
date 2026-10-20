import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { TransactionType } from "./TransactionEntity";

export type RecurrenceFrequency = "BIWEEKLY" | "MONTHLY" | "WEEKLY" | "YEARLY";

// Which occurrences an edit or a delete reaches (spec 034 FR 19, 28).
export type RecurrenceScope = "ALL" | "ONLY_THIS" | "THIS_AND_NEXT";

export type RecurrenceStatus = "ACTIVE" | "ENDED";

interface IRecurrenceEntity {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  currency?: CurrencyCode;
  description: string;
  // ISO date-time of the last day; absent = no end date.
  endDate?: string;
  firstNumber: number;
  frequency: RecurrenceFrequency;
  id: string;
  nextOccurrenceDate?: string;
  // Total shown as "k/n"; absent without an end date.
  occurrenceCount?: number;
  owner: OwnerType;
  ownerId: string;
  startDate: string;
  status: RecurrenceStatus;
  type: TransactionType;
  value: string;
}

// A recurring series (spec 034): the template plus its schedule.
class RecurrenceEntity {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  currency: CurrencyCode;
  description: string;
  endDate?: string;
  firstNumber: number;
  frequency: RecurrenceFrequency;
  id: string;
  nextOccurrenceDate?: string;
  occurrenceCount?: number;
  owner: OwnerType;
  ownerId: string;
  startDate: string;
  status: RecurrenceStatus;
  type: TransactionType;
  value: string;

  constructor(params: IRecurrenceEntity) {
    this.accountId = params.accountId;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.description = params.description;
    this.endDate = params.endDate;
    this.firstNumber = params.firstNumber;
    this.frequency = params.frequency;
    this.id = params.id;
    this.nextOccurrenceDate = params.nextOccurrenceDate;
    this.occurrenceCount = params.occurrenceCount;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.startDate = params.startDate;
    this.status = params.status;
    this.type = params.type;
    this.value = params.value;
  }
}

export default RecurrenceEntity;
