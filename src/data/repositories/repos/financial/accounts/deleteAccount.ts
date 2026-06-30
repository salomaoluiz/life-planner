import { Datasources } from "@data/datasource";
import { FinancialAccountRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<FinancialAccountRepository["deleteAccount"]>[0];

async function deleteAccount(params: Params, datasources: Datasources) {
  await datasources.financialAccountDatasource.deleteAccount({
    id: params.id,
    ownerId: params.ownerId,
  });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
}

export default deleteAccount;
