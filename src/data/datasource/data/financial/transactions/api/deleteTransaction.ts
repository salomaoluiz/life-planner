import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<TransactionDatasource["deleteTransaction"]>[0];
export type Response = ReturnType<TransactionDatasource["deleteTransaction"]>;

async function deleteTransaction(params: Params): Response {
  try {
    // The API authorizes through the JWT: ownerId is only kept for the interface.
    await api.delete(`/v1/finance/transactions/${params.id}`);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - deleteTransaction",
      id: params.id,
    });
  }
}

export default deleteTransaction;
