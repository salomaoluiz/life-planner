import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetDailyBalancesUseCaseParams {
  // `YYYY-MM`, at most 12 months after the current one.
  month: string;
  ownerIds: string[];
}

function getDailyBalancesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetDailyBalancesUseCaseParams,
  DailyBalanceDTO
> {
  return {
    execute: async (params) => {
      try {
        const entity =
          await repositories.financialRepository.account.getDailyBalances(
            params,
          );

        return DailyBalanceDTO.fromEntity(entity);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getDailyBalancesUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.get_daily_balances_use_case",
  };
}

export default getDailyBalancesUseCase;
