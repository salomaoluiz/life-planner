import { StockOwnerChangePreviewDTO } from "@application/dto/stock/StockCatalogDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export type GetOwnerChangePreviewUseCaseParams = {
  itemId: string;
  owner: string;
  ownerId: string;
};

function getOwnerChangePreviewUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetOwnerChangePreviewUseCaseParams,
  StockOwnerChangePreviewDTO
> {
  return {
    execute: async (params: GetOwnerChangePreviewUseCaseParams) => {
      try {
        const result =
          await repositories.stockRepository.getOwnerChangePreview(params);

        return result;
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "getOwnerChangePreviewUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_owner_change_preview_use_case",
  };
}

export default getOwnerChangePreviewUseCase;
