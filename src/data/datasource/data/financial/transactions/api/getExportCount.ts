import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import exportParams from "./exportQuery";

export type Params = Parameters<TransactionDatasource["getExportCount"]>[0];
export type Response = ReturnType<TransactionDatasource["getExportCount"]>;

// Spec 047 FR 2: the live count of the export modal, straight from the API (no cache).
async function getExportCount(params: Params): Response {
  try {
    const data = await api.get<{ count: number }>(
      `/v1/finance/transactions/export/count?${exportParams(params).toString()}`,
    );

    return data.count;
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - getExportCount",
    });
  }
}

export default getExportCount;
