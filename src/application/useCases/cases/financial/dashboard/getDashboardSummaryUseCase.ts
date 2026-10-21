import { DashboardSummaryDTO } from "@application/dto/financial/DashboardDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { DashboardQueryParams } from "@domain/repositories/financial";

export type GetDashboardSummaryUseCaseParams = DashboardQueryParams;

function getDashboardSummaryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetDashboardSummaryUseCaseParams,
  DashboardSummaryDTO
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.financialRepository.dashboard.getSummary(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getDashboardSummaryUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.get_dashboard_summary_use_case",
  };
}

export default getDashboardSummaryUseCase;
