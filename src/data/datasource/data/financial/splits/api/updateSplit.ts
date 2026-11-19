import { todayCalendarDate } from "@data/models/financial/calendarDate";
import SplitModel, {
  SplitUpdateResponse,
} from "@data/models/financial/SplitModel";
import { SplitDatasource } from "@data/repositories/repos/financial/splits/splitDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import splitUnprocessableError from "../../splitUnprocessableError";
import toBody from "./toBody";

export type Params = Parameters<SplitDatasource["updateSplit"]>[0];
export type Response = ReturnType<SplitDatasource["updateSplit"]>;

async function updateSplit(params: Params): Response {
  const body = toBody(params);

  try {
    const response = await api.patch<SplitUpdateResponse>(
      `/v1/finance/splits/${params.id}?today=${todayCalendarDate()}`,
      body,
    );

    return SplitModel.fromUpdateResponse(response);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "SplitDatasource - updateSplit", id: params.id },
      { fields: body, unprocessable: splitUnprocessableError },
    );
  }
}

export default updateSplit;
