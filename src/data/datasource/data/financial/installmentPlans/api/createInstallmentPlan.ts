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
  InstallmentPlanDatasource["createInstallmentPlan"]
>[0];
export type Response = ReturnType<
  InstallmentPlanDatasource["createInstallmentPlan"]
>;

async function createInstallmentPlan(params: Params): Response {
  // Conversions throw FieldInvalid BEFORE any network call. `value` is the TOTAL.
  const body = {
    categoryId: params.categoryId,
    creditCardId: params.creditCardId,
    date: isoToCalendarDate(params.date),
    description: params.description,
    installments: params.installments,
    notes: params.notes,
    owner: params.owner,
    ownerId: params.ownerId,
    tags: params.tags,
    today: todayCalendarDate(),
    value: decimalStringToCents(params.value),
  };

  try {
    const data = await api.post<Record<string, unknown>>(
      "/v1/finance/installment-plans",
      body,
    );

    return InstallmentPlanModel.fromJSON(data);
  } catch (error) {
    return handleFinancialApiError(
      error,
      {
        datasource: "InstallmentPlanDatasource - createInstallmentPlan",
        ownerId: params.ownerId,
      },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default createInstallmentPlan;
