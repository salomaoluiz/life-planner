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
      date: params.date,
      description: params.description,
      owner: params.owner,
      ownerId: params.ownerId,
      type: params.type,
      value: params.value,
    });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);

  return new TransactionEntity({
    accountId: transaction.accountId,
    category: transaction.category,
    categoryId: transaction.categoryId,
    date: transaction.date,
    description: transaction.description,
    id: transaction.id,
    owner: OwnerType[transaction.owner],
    ownerId: transaction.ownerId,
    type: TransactionType[transaction.type],
    value: transaction.value,
  });
}
export default createTransaction;
