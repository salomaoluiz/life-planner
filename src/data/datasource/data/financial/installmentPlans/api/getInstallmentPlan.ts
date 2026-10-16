import { todayCalendarDate } from "@data/models/financial/calendarDate";
import InstallmentPlanModel from "@data/models/financial/InstallmentPlanModel";
import { InstallmentPlanDatasource } from "@data/repositories/repos/financial/installmentPlans/installmentPlanDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<
  InstallmentPlanDatasource["getInstallmentPlan"]
>[0];
export type Response = ReturnType<
  InstallmentPlanDatasource["getInstallmentPlan"]
>;

async function getInstallmentPlan(id: Params): Response {
  try {
    const data = await api.get<Record<string, unknown>>(
      `/v1/finance/installment-plans/${id}?today=${todayCalendarDate()}`,
    );

    return InstallmentPlanModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(error, {
      datasource: "InstallmentPlanDatasource - getInstallmentPlan",
      id,
    });
  }
}

export default getInstallmentPlan;
