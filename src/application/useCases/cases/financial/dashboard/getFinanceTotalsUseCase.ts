import { DashboardTotalsDTO } from "@application/dto/financial/DashboardDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { GetTotalsRepositoryParams } from "@domain/repositories/financial";

export type GetFinanceTotalsUseCaseParams = GetTotalsRepositoryParams;

function getFinanceTotalsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetFinanceTotalsUseCaseParams,
  DashboardTotalsDTO
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.financialRepository.dashboard.getTotals(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getFinanceTotalsUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.get_finance_totals_use_case",
  };
}

export default getFinanceTotalsUseCase;
