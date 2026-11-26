import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { WasteEntity } from "@domain/entities/stock/StockWasteEntity";
import Repositories from "@domain/repositories";
import { GetWasteRepositoryParams } from "@domain/repositories/stock";

export type GetWasteUseCaseParams = GetWasteRepositoryParams;

// Spec 123 FR 29-31: the Waste screen of one month.
function getWasteUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<GetWasteUseCaseParams, WasteEntity> {
  return {
    execute: async (params: GetWasteUseCaseParams) => {
      try {
        return await repositories.stockRepository.getWaste(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getWasteUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_waste_use_case",
  };
}

export default getWasteUseCase;
