import { Datasources } from "@data/datasource";
import TransactionEntity, {
  TransactionOwners,
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { FinancialTransactionRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialTransactionRepository["createTransaction"]
>[0];

async function createTransaction(params: Params, datasources: Datasources) {
  const transaction =
    await datasources.financialTransactionDatasource.createTransaction({
      category: params.category,
      date: params.date,
      description: params.description,
      owner: params.owner,
      ownerId: params.ownerId,
      type: params.type,
      value: params.value,
    });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);

  return new TransactionEntity({
    category: transaction.category,
    date: transaction.date,
    description: transaction.description,
    id: transaction.id,
    owner: TransactionOwners[transaction.owner],
    ownerId: transaction.ownerId,
    type: TransactionType[transaction.type],
    value: transaction.value,
  });
}
export default createTransaction;
