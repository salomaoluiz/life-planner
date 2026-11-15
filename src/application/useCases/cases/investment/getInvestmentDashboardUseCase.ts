import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentDashboard } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentDashboardParams } from "@domain/repositories/investment";

// Spec 110: the investments overview of the filtered owners over a period.
function getInvestmentDashboardUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentDashboardParams,
  InvestmentDashboard
> {
  return {
    execute: async (params: GetInvestmentDashboardParams) => {
      try {
        return await repositories.investmentRepository.getDashboard(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentDashboardUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_dashboard_use_case",
  };
}

export default getInvestmentDashboardUseCase;
