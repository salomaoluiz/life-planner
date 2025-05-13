import { Datasources } from "@data/datasource";
import { FinancialTransactionRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialTransactionRepository["deleteTransaction"]
>[0];

async function deleteTransaction(params: Params, datasources: Datasources) {
  await datasources.financialTransactionDatasource.deleteTransaction({
    id: params.id,
    ownerId: params.ownerId,
  });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
}
export default deleteTransaction;
