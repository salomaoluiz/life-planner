import { decimalToCents } from "@data/models/financial/money";
import { AccountDatasource } from "@data/repositories/repos/financial/accounts/accountDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<AccountDatasource["updateAccount"]>[0];
export type Response = ReturnType<AccountDatasource["updateAccount"]>;

async function updateAccount(params: Params): Response {
  // The API rejects owner / ownerId on PATCH: only editable fields travel.
  const body = {
    balance:
      params.balance === undefined ? undefined : decimalToCents(params.balance),
    icon: params.icon,
    name: params.name,
    status: params.status,
  };

  if (Object.values(body).every((value) => value === undefined)) {
    return;
  }

  try {
    await api.patch(`/v1/finance/accounts/${params.id}`, body);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "AccountDatasource - updateAccount", id: params.id },
      { fields: body },
    );
  }
}

export default updateAccount;
