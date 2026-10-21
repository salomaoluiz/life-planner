import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import exportParams from "./exportQuery";

export type Params = Parameters<TransactionDatasource["exportTransactions"]>[0];
export type Response = ReturnType<TransactionDatasource["exportTransactions"]>;

// Spec 047 FR 3: the CSV text and the filename the API chose (`transacoes-…` or `transactions-…`).
async function exportTransactions(params: Params): Response {
  const query = exportParams(params);

  query.append("format", params.format);
  query.append("lang", params.lang);

  try {
    const { filename, text } = await api.getText(
      `/v1/finance/transactions/export?${query.toString()}`,
    );

    return {
      csv: text,
      filename: filename ?? `transactions-${params.from}_${params.to}.csv`,
    };
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "TransactionDatasource - exportTransactions",
    });
  }
}

export default exportTransactions;
