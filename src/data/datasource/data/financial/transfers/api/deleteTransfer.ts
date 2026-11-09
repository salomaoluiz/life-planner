import { TransferDatasource } from "@data/repositories/repos/financial/transfers/transferDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<TransferDatasource["deleteTransfer"]>[0];
export type Response = ReturnType<TransferDatasource["deleteTransfer"]>;

async function deleteTransfer(params: Params): Response {
  try {
    await api.delete(
      `/v1/finance/transfers/${params.id}${params.scope ? `?scope=${params.scope}` : ""}`,
    );
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "TransferDatasource - deleteTransfer", id: params.id },
      { unprocessable: unprocessableError },
    );
  }
}

export default deleteTransfer;
