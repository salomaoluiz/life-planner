import { Datasources } from "@data/datasource";
import { FinancialTransactionRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialTransactionRepository["updateTransaction"]
>[0];

async function updateTransaction(params: Params, datasources: Datasources) {
  await datasources.financialTransactionDatasource.updateTransaction({
    accountId: params.accountId,
    category: params.category,
    categoryId: params.categoryId,
    date: params.date,
    description: params.description,
    id: params.id,
    owner: params.owner,
    ownerId: params.ownerId,
    type: params.type,
    value: params.value,
  });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
}

export default updateTransaction;
