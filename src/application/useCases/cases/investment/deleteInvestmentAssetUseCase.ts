import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function deleteInvestmentAssetUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  return {
    execute: async (params: string) => {
      try {
        return await repositories.investmentRepository.deleteAsset(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.deleteInvestmentAssetUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.delete_asset_use_case",
  };
}

export default deleteInvestmentAssetUseCase;
