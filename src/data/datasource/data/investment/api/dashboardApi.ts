import InvestmentModel from "@data/models/investment/InvestmentModel";
import { GetInvestmentDashboardParams } from "@domain/repositories/investment";
import { api } from "@infrastructure/api";

import handleInvestmentApiError from "./investmentApiError";

type Json = Record<string, unknown>;

// Spec 110 section 7: the whole overview in one call, consolidated in BRL.
async function getDashboard(params: GetInvestmentDashboardParams) {
  const query = [
    ...params.ownerIds.map((id) => `ownerId=${encodeURIComponent(id)}`),
    `from=${encodeURIComponent(params.from)}`,
    `to=${encodeURIComponent(params.to)}`,
    `today=${encodeURIComponent(params.today)}`,
  ].join("&");

  try {
    return InvestmentModel.toDashboard(
      await api.get<Json>(`/v1/investments/dashboard?${query}`),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getDashboard",
    });
  }
}

export default { getDashboard };
