import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  toCurrencyCode,
} from "@domain/entities/financial/Currency";

import { calendarDateToIso } from "./calendarDate";
import { centsToDecimalString } from "./money";
import {
  OwnerType,
  RecurrenceFrequency,
  TransactionType,
} from "./TransactionModel";

export type RecurrenceStatus = "ACTIVE" | "ENDED";

interface IRecurrenceModel {
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  currency?: CurrencyCode;
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
}

// API shape of a series (`/v1/finance/recurrences`): money in cents there, decimal strings here.
class RecurrenceModel implements IRecurrenceModel {
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

  constructor(params: IRecurrenceModel) {
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

  static fromJSON(data: Record<string, unknown>): RecurrenceModel {
    const category = data.category as undefined | { name?: string };

    return new RecurrenceModel({
      accountId: (data.accountId as null | string) ?? undefined,
      category: category?.name ?? "",
      categoryId: data.categoryId as string,
      creditCardId: (data.creditCardId as null | string) ?? undefined,
      currency: toCurrencyCode(data.currency),
      description: data.description as string,
      endDate: data.endDate
        ? calendarDateToIso(data.endDate as string)
        : undefined,
      firstNumber: Number(data.firstNumber),
      frequency: data.frequency as RecurrenceFrequency,
      id: data.id as string,
      nextOccurrenceDate: data.nextOccurrenceDate
        ? calendarDateToIso(data.nextOccurrenceDate as string)
        : undefined,
      occurrenceCount: (data.occurrenceCount as null | number) ?? undefined,
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      startDate: calendarDateToIso(data.startDate as string),
      status: data.status as RecurrenceStatus,
      type: data.type as TransactionType,
      value: centsToDecimalString(Number(data.value)),
    });
  }
}

export default RecurrenceModel;
