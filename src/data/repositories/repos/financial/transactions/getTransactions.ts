import { Datasources } from "@data/datasource";
import TransactionModel from "@data/models/financial/TransactionModel";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { FinancialTransactionRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialTransactionRepository["getTransactions"]
>[0];

export type Range = Parameters<
  FinancialTransactionRepository["getTransactions"]
>[1];

async function getTransactions(
  ownerIds: Params,
  datasources: Datasources,
  range?: Range,
) {
  // A period is small and short-lived (the screen keeps it in memory): it is never persisted.
  if (range) {
    const models =
      await datasources.financialTransactionDatasource.getTransactions(
        ownerIds,
        range,
      );

    return models.map((transaction) => toTransactionEntity(transaction));
  }

  const cacheOptions = { uniqueId: ownersCacheId(ownerIds) };
  const cached = cache.get<Array<Record<string, unknown>> | null>(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
    cacheOptions,
  );

  let transactionsModel: TransactionModel[] = [];

  // An empty list is never trusted: it is what a call without owners (or a failed write) leaves behind, and it hid every transaction for an hour.
  if (cached && cached.length > 0) {
    transactionsModel = cached.map((cache) => TransactionModel.fromJSON(cache));
  } else {
    transactionsModel =
      await datasources.financialTransactionDatasource.getTransactions(
        ownerIds,
      );
    if (transactionsModel.length > 0) {
      cache.set<Record<string, unknown>[]>(
        CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
        transactionsModel.map((financial) => financial.toJSON()),
        cacheOptions,
      );
    }
  }

  return transactionsModel.map((transaction) =>
    toTransactionEntity(transaction),
  );
}

// One persisted entry per owner set (spec 075): a call for one owner must never be read back as the list of every owner.
function ownersCacheId(ownerIds: string[]) {
  return `:${[...ownerIds].sort().join(",")}`;
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
