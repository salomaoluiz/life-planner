import { todayCalendarDate } from "@data/models/financial/calendarDate";
import SplitModel, {
  SplitWithLookups,
} from "@data/models/financial/SplitModel";
import { SplitDatasource } from "@data/repositories/repos/financial/splits/splitDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import splitUnprocessableError from "../../splitUnprocessableError";
import toBody from "./toBody";

export type Params = Parameters<SplitDatasource["createSplit"]>[0];
export type Response = ReturnType<SplitDatasource["createSplit"]>;

async function createSplit(params: Params): Response {
  const body = {
    ...toBody(params),
    fromTransactionId: params.fromTransactionId,
  };

  try {
    const response = await api.post<SplitWithLookups>(
      `/v1/finance/splits?today=${todayCalendarDate()}`,
      body,
    );

    return SplitModel.fromResponse(response);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "SplitDatasource - createSplit" },
      { fields: body, unprocessable: splitUnprocessableError },
    );
  }
}

export default createSplit;
