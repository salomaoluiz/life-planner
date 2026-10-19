import { CardInvoiceCardEntity } from "@domain/entities/financial/CardInvoiceEntity";
import ProjectedOccurrenceEntity from "@domain/entities/financial/ProjectedOccurrenceEntity";
import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import TransactionDTO from "./TransactionDTO";

class ProjectedOccurrenceDTO {
  accountId?: string;
  accountName?: string;
  category: string;
  categoryId: string;
  creditCardColor?: string;
  creditCardId?: string;
  creditCardLastDigits?: string;
  creditCardTitle?: string;
  date: string;
  description: string;
  frequency: RecurrenceFrequency;
  invoiceListDate?: string;
  invoiceMonth?: string;
  occurrenceCount?: number;
  occurrenceNumber: number;
  owner: string;
  ownerId: string;
  recurrenceId: string;
  type: string;
  value: string;

  constructor(params: {
    accountId?: string;
    accountName?: string;
    category: string;
    categoryId: string;
    creditCardColor?: string;
    creditCardId?: string;
    creditCardLastDigits?: string;
    creditCardTitle?: string;
    date: string;
    description: string;
    frequency: RecurrenceFrequency;
    invoiceListDate?: string;
    invoiceMonth?: string;
    occurrenceCount?: number;
    occurrenceNumber: number;
    owner: string;
    ownerId: string;
    recurrenceId: string;
    type: string;
    value: string;
  }) {
    this.accountId = params.accountId;
    this.accountName = params.accountName;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardColor = params.creditCardColor;
    this.creditCardId = params.creditCardId;
    this.creditCardLastDigits = params.creditCardLastDigits;
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

  static fromEntity(entity: ProjectedOccurrenceEntity) {
    return new ProjectedOccurrenceDTO({ ...entity });
  }

  // The card of a card occurrence, as the invoice line needs it.
  toInvoiceCard(): CardInvoiceCardEntity | undefined {
    return this.creditCardId
      ? {
          color: this.creditCardColor ?? "",
          id: this.creditCardId,
          lastDigits: this.creditCardLastDigits,
          owner: OwnerType[this.owner as keyof typeof OwnerType],
          ownerId: this.ownerId,
          title: this.creditCardTitle ?? "",
        }
      : undefined;
  }

  // A projected row shown like a transaction (muted, no pay button): the list reuses the transaction row.
  toTransactionDTO(): TransactionDTO {
    return new TransactionDTO({
      accountId: this.accountId,
      accountName: this.accountName,
      category: this.category,
      categoryId: this.categoryId,
      categoryName: this.category,
      creditCardId: this.creditCardId,
      date: this.date,
      description: this.description,
      id: `projected-${this.recurrenceId}-${this.occurrenceNumber}`,
      invoiceMonth: this.invoiceMonth,
      isProjected: true,
      occurrenceCount: this.occurrenceCount,
      occurrenceNumber: this.occurrenceNumber,
      owner: this.owner,
      ownerId: this.ownerId,
      paid: false,
      recurrenceFrequency: this.frequency,
      recurrenceId: this.recurrenceId,
      type: this.type,
      value: this.value,
    });
  }
}

export default ProjectedOccurrenceDTO;
