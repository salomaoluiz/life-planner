import InvestmentModel from "@data/models/investment/InvestmentModel";
import { GetInvestmentsHomeSummaryParams } from "@domain/repositories/investment";
import { api } from "@infrastructure/api";

import handleInvestmentApiError from "./investmentApiError";

type Json = Record<string, unknown>;

// Spec 109 section 7: the whole home section in one call, already consolidated in BRL.
async function getHomeSummary(params: GetInvestmentsHomeSummaryParams) {
  const query = [
    ...params.ownerIds.map((id) => `ownerId=${encodeURIComponent(id)}`),
    `today=${encodeURIComponent(params.today)}`,
  ].join("&");

  try {
    return InvestmentModel.toHomeSummary(
      await api.get<Json>(`/v1/investments/summary?${query}`),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getHomeSummary",
    });
  }
}

export default { getHomeSummary };
