import TransactionModel from "@data/models/financial/TransactionModel";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import toOwnerQuery from "../../ownerQuery";

export type Params = Parameters<TransactionDatasource["getTransactions"]>[0];
export type Response = ReturnType<TransactionDatasource["getTransactions"]>;

async function getTransactions(ownerIds: Params): Response {
  // Without the filter the API returns every owner the user can access.
  if (ownerIds.length === 0) {
    return [];
  }

  try {
    const data = await api.get<Record<string, unknown>[]>(
      `/v1/finance/transactions${toOwnerQuery(ownerIds)}`,
    );

    return data.map((transaction) => TransactionModel.fromJSON(transaction));
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - getTransactions",
      ownerIds,
    });
  }
}

export default getTransactions;
