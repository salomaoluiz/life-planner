import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { ClosePreviewEntity } from "@domain/entities/stock/PurchaseEntity";
import Repositories from "@domain/repositories";
import { PurchaseRepository } from "@domain/repositories/stock";

export type GetClosePreviewUseCaseParams = Parameters<
  PurchaseRepository["getClosePreview"]
>[0];

// Spec 120: The data of the closing steps (FR 27).
function getClosePreviewUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetClosePreviewUseCaseParams,
  ClosePreviewEntity
> {
  return {
    execute: async (params: GetClosePreviewUseCaseParams) => {
      try {
        return await repositories.stockRepository.getClosePreview(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getClosePreviewUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_close_preview_use_case",
  };
}

export default getClosePreviewUseCase;
