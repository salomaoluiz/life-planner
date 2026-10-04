import { Datasources } from "@data/datasource";
import AccountModel from "@data/models/financial/AccountModel";
import AccountEntity from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache, { CacheStringKeys } from "@infrastructure/cache";

async function getAccounts(ownerIds: string[], datasources: Datasources) {
  const cached = cache.get<Array<Record<string, unknown>> | null>(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );

  let accountsModel: AccountModel[] = [];

  if (cached) {
    accountsModel = cached.map((c) => AccountModel.fromJSON(c));
  } else {
    accountsModel =
      await datasources.financialAccountDatasource.getAccounts(ownerIds);
    cache.set<Record<string, unknown>[]>(
      CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
      accountsModel.map((account) => account.toJSON()),
    );
  }

  return accountsModel.map(
    (account) =>
      new AccountEntity({
        balance: account.balance,
        icon: account.icon,
        id: account.id,
        name: account.name,
        owner: OwnerType[account.owner],
        ownerId: account.ownerId,
        status: account.status,
      }),
  );
}

export default getAccounts;
