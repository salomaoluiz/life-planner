import { calendarDateToIso } from "./calendarDate";
import { centsToDecimalString } from "./money";
import {
  OwnerType,
  RecurrenceFrequency,
  TransactionType,
} from "./TransactionModel";

interface IProjectedOccurrenceModel {
  accountId?: string;
  accountName?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  creditCardTitle?: string;
  date: string;
  description: string;
  frequency: RecurrenceFrequency;
  invoiceListDate?: string;
  invoiceMonth?: string;
  occurrenceCount?: number;
  occurrenceNumber: number;
  owner: OwnerType;
  ownerId: string;
  recurrenceId: string;
  type: TransactionType;
  value: string;
}

// API shape of an item of `GET /v1/finance/recurrences/projections`.
class ProjectedOccurrenceModel implements IProjectedOccurrenceModel {
  accountId?: string;
  accountName?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  creditCardTitle?: string;
  date: string;
  description: string;
  frequency: RecurrenceFrequency;
  invoiceListDate?: string;
  invoiceMonth?: string;
  occurrenceCount?: number;
  occurrenceNumber: number;
  owner: OwnerType;
  ownerId: string;
  recurrenceId: string;
  type: TransactionType;
  value: string;

  constructor(params: IProjectedOccurrenceModel) {
    this.accountId = params.accountId;
    this.accountName = params.accountName;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.creditCardTitle = params.creditCardTitle;
    this.date = params.date;
    this.description = params.description;
    this.frequency = params.frequency;
    this.invoiceListDate = params.invoiceListDate;
    this.invoiceMonth = params.invoiceMonth;
    this.occurrenceCount = params.occurrenceCount;
    this.occurrenceNumber = params.occurrenceNumber;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.recurrenceId = params.recurrenceId;
    this.type = params.type;
    this.value = params.value;
  }

  static fromJSON(data: Record<string, unknown>): ProjectedOccurrenceModel {
    const account = data.account as
      | null
      | undefined
      | { id: string; name: string };
    const category = data.category as
      | undefined
      | { id?: string; name?: string };
    const card = data.creditCard as
      | null
      | undefined
      | { id: string; title: string };

    return new ProjectedOccurrenceModel({
      accountId: account?.id,
      accountName: account?.name,
      category: category?.name ?? "",
      categoryId: category?.id as string,
      creditCardId: card?.id,
      creditCardTitle: card?.title,
      date: calendarDateToIso(data.date as string),
      description: data.description as string,
      frequency: data.frequency as RecurrenceFrequency,
      invoiceListDate: (data.invoiceListDate as null | string) ?? undefined,
      invoiceMonth: (data.invoiceMonth as null | string) ?? undefined,
      occurrenceCount: (data.occurrenceCount as null | number) ?? undefined,
      occurrenceNumber: Number(data.occurrenceNumber),
      owner: data.owner as OwnerType,
      ownerId: data.ownerId as string,
      recurrenceId: data.recurrenceId as string,
      type: data.type as TransactionType,
      value: centsToDecimalString(Number(data.value)),
    });
  }
}

export default ProjectedOccurrenceModel;
