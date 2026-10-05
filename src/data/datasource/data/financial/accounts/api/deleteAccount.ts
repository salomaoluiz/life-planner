import { AccountDatasource } from "@data/repositories/repos/financial/accounts/accountDatasource";
import { AccountHasTransactions } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<AccountDatasource["deleteAccount"]>[0];
export type Response = ReturnType<AccountDatasource["deleteAccount"]>;

async function deleteAccount(params: Params): Response {
  try {
    // The API authorizes through the JWT: ownerId is only kept for the interface.
    await api.delete(`/v1/finance/accounts/${params.id}`);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "AccountDatasource - deleteAccount", id: params.id },
      { conflict: () => new AccountHasTransactions() },
    );
  }
}

export default deleteAccount;
