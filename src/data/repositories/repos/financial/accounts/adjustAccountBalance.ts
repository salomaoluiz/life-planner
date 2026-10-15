import { Datasources } from "@data/datasource";
import { FinancialAccountRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<
  FinancialAccountRepository["adjustAccountBalance"]
>[0];

async function adjustAccountBalance(params: Params, datasources: Datasources) {
  await datasources.financialAccountDatasource.adjustAccountBalance({
    balance: params.balance,
    id: params.id,
  });

  // The adjustment is a transaction: both lists changed.
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
}

export default adjustAccountBalance;
