import { Datasources } from "@data/datasource";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { FinancialTransactionRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialTransactionRepository["createTransaction"]
>[0];

async function createTransaction(params: Params, datasources: Datasources) {
  const transaction =
    await datasources.financialTransactionDatasource.createTransaction({
      accountId: params.accountId,
      category: params.category,
      categoryId: params.categoryId,
      creditCardId: params.creditCardId,
      date: params.date,
      description: params.description,
      owner: params.owner,
      ownerId: params.ownerId,
      paid: params.paid,
      tags: params.tags,
      type: params.type,
      value: params.value,
    });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
  // Every transaction write moves an account balance.
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
  // Writes create tags and move the usage counts.
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TAG_DATA);

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
export default createTransaction;
