import { SplitDatasource } from "@data/repositories/repos/financial/splits/splitDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import splitUnprocessableError from "../../splitUnprocessableError";

export type Response = ReturnType<SplitDatasource["deleteSplit"]>;

async function deleteSplit(id: string): Response {
  try {
    await api.delete(`/v1/finance/splits/${id}`);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "SplitDatasource - deleteSplit", id },
      { unprocessable: splitUnprocessableError },
    );
  }
}

export default deleteSplit;
