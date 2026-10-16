import { todayCalendarDate } from "@data/models/financial/calendarDate";
import InstallmentPlanModel from "@data/models/financial/InstallmentPlanModel";
import { InstallmentPlanDatasource } from "@data/repositories/repos/financial/installmentPlans/installmentPlanDatasource";
import { InstallmentPaid } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<
  InstallmentPlanDatasource["prepayInstallmentPlan"]
>[0];
export type Response = ReturnType<
  InstallmentPlanDatasource["prepayInstallmentPlan"]
>;

async function prepayInstallmentPlan(params: Params): Response {
  const body = {
    date: params.date,
    discount: params.discount,
    targetInvoiceMonth: params.targetInvoiceMonth,
    today: todayCalendarDate(),
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      `/v1/finance/installment-plans/${params.planId}/prepayment`,
      body,
    );

    return InstallmentPlanModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "InstallmentPlanDatasource - prepayInstallmentPlan",
        planId: params.planId,
      },
      {
        conflict: () => new InstallmentPaid(),
        fields: body,
        unprocessable: unprocessableError,
      },
    );
  }
}

export default prepayInstallmentPlan;
