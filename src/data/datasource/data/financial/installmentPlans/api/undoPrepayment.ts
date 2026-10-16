import { InstallmentPlanDatasource } from "@data/repositories/repos/financial/installmentPlans/installmentPlanDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<InstallmentPlanDatasource["undoPrepayment"]>[0];
export type Response = ReturnType<InstallmentPlanDatasource["undoPrepayment"]>;

async function undoPrepayment(planId: Params): Response {
  try {
    await api.delete(`/v1/finance/installment-plans/${planId}/prepayment`);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "InstallmentPlanDatasource - undoPrepayment", planId },
      { unprocessable: unprocessableError },
    );
  }
}

export default undoPrepayment;
