import { BalanceSeriesDTO } from "@application/dto/financial/DashboardDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { GetBalanceSeriesRepositoryParams } from "@domain/repositories/financial";

export type GetBalanceSeriesUseCaseParams = GetBalanceSeriesRepositoryParams;

function getBalanceSeriesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetBalanceSeriesUseCaseParams,
  BalanceSeriesDTO
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.financialRepository.dashboard.getBalanceSeries(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getBalanceSeriesUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.get_balance_series_use_case",
  };
}

export default getBalanceSeriesUseCase;
