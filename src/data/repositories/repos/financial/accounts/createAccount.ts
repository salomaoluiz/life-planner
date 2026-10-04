import { Datasources } from "@data/datasource";
import AccountEntity from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { FinancialAccountRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<FinancialAccountRepository["createAccount"]>[0];

async function createAccount(params: Params, datasources: Datasources) {
  const account = await datasources.financialAccountDatasource.createAccount({
    balance: params.balance,
    icon: params.icon,
    name: params.name,
    owner: params.owner,
    ownerId: params.ownerId,
    status: params.status,
  });

  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);

  return new AccountEntity({
    balance: account.balance,
    icon: account.icon,
    id: account.id,
    name: account.name,
    owner: OwnerType[account.owner],
    ownerId: account.ownerId,
    status: account.status,
  });
}

export default createAccount;
