import { Datasources } from "@data/datasource";
import { FinancialTransactionRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialTransactionRepository["importTransactions"]
>[0];

// Spec 047: every row is written or none; the lists that follow the transactions are refreshed afterwards.
async function importTransactions(params: Params, datasources: Datasources) {
  const created =
    await datasources.financialTransactionDatasource.importTransactions(params);

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
  // Paid rows move account balances.
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
  // New tags are created and the usage counts move.
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TAG_DATA);

  return created;
}

export default importTransactions;
