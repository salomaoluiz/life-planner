import { InstallmentPlanDatasource } from "@data/repositories/repos/financial/installmentPlans/installmentPlanDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<
  InstallmentPlanDatasource["deleteInstallmentPlan"]
>[0];
export type Response = ReturnType<
  InstallmentPlanDatasource["deleteInstallmentPlan"]
>;

async function deleteInstallmentPlan(id: Params): Response {
  try {
    await api.delete(`/v1/finance/installment-plans/${id}`);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "InstallmentPlanDatasource - deleteInstallmentPlan", id },
      { unprocessable: unprocessableError },
    );
  }
}

export default deleteInstallmentPlan;
