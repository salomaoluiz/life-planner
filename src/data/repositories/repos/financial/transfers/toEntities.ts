import TransactionModel from "@data/models/financial/TransactionModel";
import TransferModel from "@data/models/financial/TransferModel";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import TransferEntity from "@domain/entities/financial/TransferEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { TransferResultEntity } from "@domain/repositories/financial";

function toTransactionEntity(row: TransactionModel): TransactionEntity {
  return new TransactionEntity({
    accountId: row.accountId,
    category: row.category,
    categoryId: row.categoryId,
    creditCardId: row.creditCardId,
    currency: row.currency,
    date: row.date,
    description: row.description,
    earlyPayment: row.earlyPayment,
    excludeFromTotals: row.excludeFromTotals,
    id: row.id,
    installmentCount: row.installmentCount,
    installmentNumber: row.installmentNumber,
    installmentPlanId: row.installmentPlanId,
    invoiceMonth: row.invoiceMonth,
    notes: row.notes ?? undefined,
    occurrenceCount: row.occurrenceCount,
    occurrenceNumber: row.occurrenceNumber,
    owner: OwnerType[row.owner],
    ownerId: row.ownerId,
    paid: row.paid,
    projected: row.projected,
    recurrenceFrequency: row.recurrenceFrequency,
    recurrenceId: row.recurrenceId,
    systemKey: row.systemKey,
    tags: row.tags,
    transfer: row.transfer,
    transferId: row.transferId,
    type: TransactionType[row.type],
    value: row.value,
  });
}

function toTransferEntity(transfer: TransferModel): TransferEntity {
  return new TransferEntity({ ...transfer });
}

function toTransferResult(result: {
  rows: TransactionModel[];
  transfer: TransferModel;
}): TransferResultEntity {
  return {
    rows: result.rows.map((row) => toTransactionEntity(row)),
    transfer: toTransferEntity(result.transfer),
  };
}

export { toTransferResult };
