import { todayCalendarDate } from "@data/models/financial/calendarDate";
import PrepaymentPreviewModel from "@data/models/financial/PrepaymentPreviewModel";
import { InstallmentPlanDatasource } from "@data/repositories/repos/financial/installmentPlans/installmentPlanDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<
  InstallmentPlanDatasource["previewPrepayment"]
>[0];
export type Response = ReturnType<
  InstallmentPlanDatasource["previewPrepayment"]
>;

async function previewPrepayment(params: Params): Response {
  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/finance/installment-plans/${params.planId}/prepayment-preview?targetInvoiceMonth=${params.targetInvoiceMonth}&today=${todayCalendarDate()}`,
    );

    return PrepaymentPreviewModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "InstallmentPlanDatasource - previewPrepayment",
        planId: params.planId,
      },
      { unprocessable: unprocessableError },
    );
  }
}

export default previewPrepayment;
