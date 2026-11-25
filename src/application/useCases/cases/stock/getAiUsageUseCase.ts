import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { AiUsageEntity } from "@domain/entities/stock/StockBarcodeEntity";
import Repositories from "@domain/repositories";

// Spec 121 FR 23: the AI calls the user has made today next to their limits.
function getAiUsageUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<AiUsageEntity> {
  return {
    execute: async () => {
      try {
        return await repositories.stockRepository.getAiUsage();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "getAiUsageUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "stock.get_ai_usage_use_case",
  };
}

export default getAiUsageUseCase;
