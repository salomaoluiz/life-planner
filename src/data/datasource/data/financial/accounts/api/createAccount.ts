import AccountModel from "@data/models/financial/AccountModel";
import { decimalToCents } from "@data/models/financial/money";
import { AccountDatasource } from "@data/repositories/repos/financial/accounts/accountDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<AccountDatasource["createAccount"]>[0];
export type Response = ReturnType<AccountDatasource["createAccount"]>;

async function createAccount(params: Params): Response {
  const body = {
    balance: decimalToCents(params.balance),
    icon: params.icon,
    name: params.name,
    owner: params.owner,
    ownerId: params.ownerId,
    status: params.status,
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      "/v1/finance/accounts",
      body,
    );

    return AccountModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "AccountDatasource - createAccount",
        ownerId: params.ownerId,
      },
      { fields: body },
    );
  }
}

export default createAccount;
