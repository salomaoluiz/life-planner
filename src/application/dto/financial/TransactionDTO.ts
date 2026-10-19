import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import TransactionEntity, {
  EarlyPaymentRefEntity,
} from "@domain/entities/financial/TransactionEntity";

export interface ITransactionDTO {
  accountId?: string;
  accountName?: string;
  category: string;
  categoryId: string;
  categoryName?: string;
  creditCardId?: string;
  date: string;
  description: string;
  earlyPayment?: EarlyPaymentRefEntity;
  excludeFromTotals?: boolean;
  id: string;
  installmentCount?: number;
  installmentNumber?: number;
  installmentPlanId?: string;
  invoiceMonth?: string;
  // Front-only: a projected occurrence of a series (spec 034), not a stored row.
  isProjected?: boolean;
  occurrenceCount?: number;
  occurrenceNumber?: number;
  owner: string;
  ownerId: string;
  paid?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  systemKey?: string;
  type: string;
  value: string;
}

class TransactionDTO {
  accountId?: string;
  accountName?: string;
  category: string;
  categoryId: string;
  categoryName?: string;
  creditCardId?: string;
  date: string;
  description: string;
  earlyPayment?: EarlyPaymentRefEntity;
  excludeFromTotals: boolean;
  id: string;
  installmentCount?: number;
  installmentNumber?: number;
  installmentPlanId?: string;
  invoiceMonth?: string;
  isProjected: boolean;
  occurrenceCount?: number;
  occurrenceNumber?: number;
  owner: string;
  ownerId: string;
  paid: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  systemKey?: string;
  type: string;
  value: string;

  constructor(params: ITransactionDTO) {
    this.accountId = params.accountId;
    this.date = params.date;
    this.category = params.category;
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.installmentCount = params.installmentCount;
    this.installmentNumber = params.installmentNumber;
    this.installmentPlanId = params.installmentPlanId;
    this.invoiceMonth = params.invoiceMonth;
    this.isProjected = params.isProjected ?? false;
    this.occurrenceCount = params.occurrenceCount;
    this.occurrenceNumber = params.occurrenceNumber;
    this.recurrenceFrequency = params.recurrenceFrequency;
    this.recurrenceId = params.recurrenceId;
    this.categoryName = params.categoryName;
    this.accountName = params.accountName;
    this.description = params.description;
    this.earlyPayment = params.earlyPayment;
    this.id = params.id;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.paid = params.paid ?? true;
    this.excludeFromTotals = params.excludeFromTotals ?? false;
    this.systemKey = params.systemKey;
    this.type = params.type;
    this.value = params.value;
  }

  static fromEntity(
    entity: TransactionEntity,
    categoryName?: string,
    accountName?: string,
  ) {
    return new TransactionDTO({
      accountId: entity.accountId,
      accountName: accountName,
      category: entity.category,
      categoryId: entity.categoryId,
      categoryName: categoryName,
      creditCardId: entity.creditCardId,
      date: entity.date,
      description: entity.description,
      earlyPayment: entity.earlyPayment,
      excludeFromTotals: entity.excludeFromTotals,
      id: entity.id,
      installmentCount: entity.installmentCount,
      installmentNumber: entity.installmentNumber,
      installmentPlanId: entity.installmentPlanId,
      invoiceMonth: entity.invoiceMonth,
      occurrenceCount: entity.occurrenceCount,
      occurrenceNumber: entity.occurrenceNumber,
      owner: entity.owner,
      ownerId: entity.ownerId,
      paid: entity.paid,
      recurrenceFrequency: entity.recurrenceFrequency,
      recurrenceId: entity.recurrenceId,
      systemKey: entity.systemKey,
      type: entity.type,
      value: entity.value,
    });
  }
}

export default TransactionDTO;
