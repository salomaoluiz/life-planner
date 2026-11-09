import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentAssetsParams } from "@domain/repositories/investment";

function getInvestmentAssetsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentAssetsParams,
  InvestmentAsset[]
> {
  return {
    execute: async (params: GetInvestmentAssetsParams) => {
      try {
        return await repositories.investmentRepository.getAssets(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentAssetsUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_assets_use_case",
  };
}

export default getInvestmentAssetsUseCase;
