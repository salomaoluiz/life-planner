import { Datasources } from "@data/datasource";
import TransactionModel from "@data/models/financial/TransactionModel";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { FinancialTransactionRepository } from "@domain/repositories/financial";

export type Options = Parameters<
  FinancialTransactionRepository["getTransactions"]
>[2];

export type Params = Parameters<
  FinancialTransactionRepository["getTransactions"]
>[0];

export type Range = Parameters<
  FinancialTransactionRepository["getTransactions"]
>[1];

async function getTransactions(
  ownerIds: Params,
  datasources: Datasources,
  range: Range,
  options?: Options,
) {
  // A period is small and short-lived (the screen keeps it in memory): it is never persisted.
  const models =
    await datasources.financialTransactionDatasource.getTransactions(
      ownerIds,
      range,
      options,
    );

  return models.map((transaction) => toTransactionEntity(transaction));
}

function toTransactionEntity(transaction: TransactionModel) {
  return new TransactionEntity({
    accountId: transaction.accountId,
    category: transaction.category,
    categoryId: transaction.categoryId,
    creditCardId: transaction.creditCardId,
    currency: transaction.currency,
    date: transaction.date,
    description: transaction.description,
    earlyPayment: transaction.earlyPayment,
    excludeFromTotals: transaction.excludeFromTotals,
    id: transaction.id,
    installmentCount: transaction.installmentCount,
    installmentNumber: transaction.installmentNumber,
    installmentPlanId: transaction.installmentPlanId,
    invoiceMonth: transaction.invoiceMonth,
    notes: transaction.notes,
    occurrenceCount: transaction.occurrenceCount,
    occurrenceNumber: transaction.occurrenceNumber,
    owner: OwnerType[transaction.owner],
    ownerId: transaction.ownerId,
    paid: transaction.paid,
    projected: transaction.projected,
    recurrenceFrequency: transaction.recurrenceFrequency,
    recurrenceId: transaction.recurrenceId,
    systemKey: transaction.systemKey,
    tags: transaction.tags,
    type: TransactionType[transaction.type],
    value: transaction.value,
  });
}

export default getTransactions;
export { toTransactionEntity };
