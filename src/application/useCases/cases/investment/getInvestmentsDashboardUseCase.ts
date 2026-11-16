import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentsDashboard } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentsDashboardParams } from "@domain/repositories/investment";

// Spec 110: one call to GET /v1/investments/dashboard. Never cached here (money data); React Query caches the read.
function getInvestmentsDashboardUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentsDashboardParams,
  InvestmentsDashboard
> {
  return {
    execute: async (params: GetInvestmentsDashboardParams) => {
      try {
        return await repositories.investmentRepository.getDashboard(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentsDashboardUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_dashboard_use_case",
  };
}

export default getInvestmentsDashboardUseCase;
