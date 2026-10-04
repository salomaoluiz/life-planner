import { Datasources } from "@data/datasource";
import { FinancialAccountRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<FinancialAccountRepository["updateAccount"]>[0];

async function updateAccount(params: Params, datasources: Datasources) {
  await datasources.financialAccountDatasource.updateAccount({
    balance: params.balance,
    icon: params.icon,
    id: params.id,
    name: params.name,
    owner: params.owner,
    ownerId: params.ownerId,
    status: params.status,
  });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
}

export default updateAccount;
