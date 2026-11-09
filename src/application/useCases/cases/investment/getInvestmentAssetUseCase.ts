import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";

function getInvestmentAssetUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, InvestmentAssetDetail> {
  return {
    execute: async (params: string) => {
      try {
        return await repositories.investmentRepository.getAsset(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentAssetUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_asset_use_case",
  };
}

export default getInvestmentAssetUseCase;
