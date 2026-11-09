import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import { TagRefEntity } from "@domain/entities/financial/TagEntity";
import TransactionEntity, {
  EarlyPaymentRefEntity,
} from "@domain/entities/financial/TransactionEntity";
import { TransferRefEntity } from "@domain/entities/financial/TransferEntity";

export interface ITransactionDTO {
  accountId?: string;
  accountName?: string;
  category: string;
  categoryId: string;
  categoryName?: string;
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
  // Front-only: a projected occurrence of a series (spec 034), not a stored row.
  isProjected?: boolean;
  notes?: string;
  occurrenceCount?: number;
  occurrenceNumber?: number;
  owner: string;
  ownerId: string;
  paid?: boolean;
  projected?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  systemKey?: string;
  tags?: TagRefEntity[];
  transfer?: TransferRefEntity;
  // Spec 098: the name of the other account of a transfer row (the one it was sent to / came from).
  transferCounterpartName?: string;
  transferId?: string;
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
  isProjected: boolean;
  notes?: string;
  occurrenceCount?: number;
  occurrenceNumber?: number;
  owner: string;
  ownerId: string;
  paid: boolean;
  projected: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceId?: string;
  systemKey?: string;
  tags: TagRefEntity[];
  transfer?: TransferRefEntity;
  transferCounterpartName?: string;
  transferId?: string;
  type: string;
  value: string;

  constructor(params: ITransactionDTO) {
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
    this.isProjected = params.isProjected ?? false;
    this.occurrenceCount = params.occurrenceCount;
    this.occurrenceNumber = params.occurrenceNumber;
    this.recurrenceFrequency = params.recurrenceFrequency;
    this.recurrenceId = params.recurrenceId;
    this.categoryName = params.categoryName;
    this.accountName = params.accountName;
    this.description = params.description;
    this.notes = params.notes;
    this.earlyPayment = params.earlyPayment;
    this.id = params.id;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.paid = params.paid ?? true;
    this.projected = params.projected ?? false;
    this.excludeFromTotals = params.excludeFromTotals ?? false;
    this.systemKey = params.systemKey;
    this.tags = params.tags ?? [];
    this.transfer = params.transfer;
    this.transferCounterpartName = params.transferCounterpartName;
    this.transferId = params.transferId;
    this.type = params.type;
    this.value = params.value;
  }

  static fromEntity(
    entity: TransactionEntity,
    categoryName?: string,
    accountName?: string,
    accounts?: { id: string; name: string }[],
  ) {
    return new TransactionDTO({
      accountId: entity.accountId,
      accountName: accountName,
      category: entity.category,
      categoryId: entity.categoryId,
      categoryName: categoryName,
      creditCardId: entity.creditCardId,
      currency: entity.currency,
      date: entity.date,
      description: entity.description,
      earlyPayment: entity.earlyPayment,
      excludeFromTotals: entity.excludeFromTotals,
      id: entity.id,
      installmentCount: entity.installmentCount,
      installmentNumber: entity.installmentNumber,
      installmentPlanId: entity.installmentPlanId,
      invoiceMonth: entity.invoiceMonth,
      notes: entity.notes,
      occurrenceCount: entity.occurrenceCount,
      occurrenceNumber: entity.occurrenceNumber,
      owner: entity.owner,
      ownerId: entity.ownerId,
      paid: entity.paid,
      projected: entity.projected,
      recurrenceFrequency: entity.recurrenceFrequency,
      recurrenceId: entity.recurrenceId,
      systemKey: entity.systemKey,
      tags: entity.tags,
      transfer: entity.transfer,
      transferCounterpartName: transferCounterpartName(entity, accounts),
      transferId: entity.transferId,
      type: entity.type,
      value: entity.value,
    });
  }
}

// Spec 098: the other account of a transfer row, by name: the destination of the out row, the origin of the in row.
function transferCounterpartName(
  entity: TransactionEntity,
  accounts?: { id: string; name: string }[],
) {
  const transfer = entity.transfer;

  if (!transfer || !accounts || transfer.counterpartHidden) {
    return undefined;
  }
  let counterpartId: string | undefined;

  if (entity.systemKey === "TRANSFER_OUT") {
    counterpartId = transfer.toAccountId;
  } else if (entity.systemKey === "TRANSFER_IN") {
    counterpartId = transfer.fromAccountId;
  }

  return accounts.find((account) => account.id === counterpartId)?.name;
}

export default TransactionDTO;
