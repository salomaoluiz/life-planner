import {
  isoToCalendarDate,
  todayCalendarDate,
} from "@data/models/financial/calendarDate";
import InstallmentPlanModel from "@data/models/financial/InstallmentPlanModel";
import { decimalStringToCents } from "@data/models/financial/money";
import { InstallmentPlanDatasource } from "@data/repositories/repos/financial/installmentPlans/installmentPlanDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<
  InstallmentPlanDatasource["updateInstallmentPlan"]
>[0];
export type Response = ReturnType<
  InstallmentPlanDatasource["updateInstallmentPlan"]
>;

async function updateInstallmentPlan(params: Params): Response {
  // Only the sent fields reach the API: "All" recalculates only when total, count, card or date really change.
  const body = {
    categoryId: params.categoryId,
    creditCardId: params.creditCardId,
    date:
      params.date === undefined ? undefined : isoToCalendarDate(params.date),
    description: params.description,
    installments: params.installments,
    value:
      params.value === undefined
        ? undefined
        : decimalStringToCents(params.value),
  };

  try {
    const data = await api.patch<Record<string, unknown>>(
      `/v1/finance/installment-plans/${params.id}?today=${todayCalendarDate()}`,
      body,
    );

    return InstallmentPlanModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "InstallmentPlanDatasource - updateInstallmentPlan",
        id: params.id,
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default updateInstallmentPlan;
