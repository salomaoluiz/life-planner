import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ConsumptionWeekEntity } from "@domain/entities/stock/StockWasteEntity";
import Repositories from "@domain/repositories";
import { GetConsumptionWeeksRepositoryParams } from "@domain/repositories/stock";

export type GetConsumptionWeeksUseCaseParams =
  GetConsumptionWeeksRepositoryParams;

// Spec 123 FR 19: the 12-week consumption chart of one item.
function getConsumptionWeeksUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetConsumptionWeeksUseCaseParams,
  ConsumptionWeekEntity[]
> {
  return {
    execute: async (params: GetConsumptionWeeksUseCaseParams) => {
      try {
        return await repositories.stockRepository.getConsumptionWeeks(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getConsumptionWeeksUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_consumption_weeks_use_case",
  };
}

export default getConsumptionWeeksUseCase;
