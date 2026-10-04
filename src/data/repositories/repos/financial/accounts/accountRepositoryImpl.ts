import { Datasources } from "@data/datasource";
import AccountEntity from "@domain/entities/financial/AccountEntity";
import { FinancialAccountRepository } from "@domain/repositories/financial";

import createAccount from "./createAccount";
import deleteAccount from "./deleteAccount";
import getAccounts from "./getAccounts";
import updateAccount from "./updateAccount";

function accountRepositoryImpl(
  datasources: Datasources,
): FinancialAccountRepository {
  return {
    async createAccount(params): Promise<AccountEntity> {
      return createAccount(params, datasources);
    },
    async deleteAccount(params): Promise<void> {
      return deleteAccount(params, datasources);
    },
    async getAccounts(ownerIds): Promise<AccountEntity[]> {
      return getAccounts(ownerIds, datasources);
    },
    async updateAccount(params): Promise<void> {
      return updateAccount(params, datasources);
    },
  };
}

export default accountRepositoryImpl;
