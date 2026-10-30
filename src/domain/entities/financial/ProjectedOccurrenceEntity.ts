import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { RecurrenceFrequency } from "./RecurrenceEntity";
import { TagRefEntity } from "./TagEntity";
import { TransactionType } from "./TransactionEntity";

interface IProjectedOccurrenceEntity {
  accountId?: string;
  accountName?: string;
  category: string;
  categoryId: string;
  creditCardColor?: string;
  creditCardId?: string;
  creditCardLastDigits?: string;
  creditCardTitle?: string;
  currency?: CurrencyCode;
  // ISO date-time of the local day.
  date: string;
  description: string;
  frequency: RecurrenceFrequency;
  // `YYYY-MM-DD` the invoice appears in the list (planned payment day); card series only.
  invoiceListDate?: string;
  // `YYYY-MM`; card series only.
  invoiceMonth?: string;
  notes?: string;
  occurrenceCount?: number;
  occurrenceNumber: number;
  owner: OwnerType;
  ownerId: string;
  recurrenceId: string;
  tags?: TagRefEntity[];
  type: TransactionType;
  value: string;
}

// A future occurrence of a series: computed by the API on read, never stored (spec 034 FR 8, 12).
class ProjectedOccurrenceEntity {
  accountId?: string;
  accountName?: string;
  category: string;
  categoryId: string;
  creditCardColor?: string;
  creditCardId?: string;
  creditCardLastDigits?: string;
  creditCardTitle?: string;
  currency: CurrencyCode;
  date: string;
  description: string;
  frequency: RecurrenceFrequency;
  invoiceListDate?: string;
  invoiceMonth?: string;
  notes?: string;
  occurrenceCount?: number;
  occurrenceNumber: number;
  owner: OwnerType;
  ownerId: string;
  recurrenceId: string;
  tags: TagRefEntity[];
  type: TransactionType;
  value: string;

  constructor(params: IProjectedOccurrenceEntity) {
    this.accountId = params.accountId;
    this.accountName = params.accountName;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardColor = params.creditCardColor;
    this.creditCardId = params.creditCardId;
    this.creditCardLastDigits = params.creditCardLastDigits;
    this.creditCardTitle = params.creditCardTitle;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.date = params.date;
    this.description = params.description;
    this.notes = params.notes;
    this.frequency = params.frequency;
    this.invoiceListDate = params.invoiceListDate;
    this.invoiceMonth = params.invoiceMonth;
    this.occurrenceCount = params.occurrenceCount;
    this.occurrenceNumber = params.occurrenceNumber;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.recurrenceId = params.recurrenceId;
    this.tags = params.tags ?? [];
    this.type = params.type;
    this.value = params.value;
  }
}

export default ProjectedOccurrenceEntity;
