import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { UpdateInvestmentAssetParams } from "@domain/repositories/investment";

function updateInvestmentAssetUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateInvestmentAssetParams,
  InvestmentAsset
> {
  return {
    execute: async (params: UpdateInvestmentAssetParams) => {
      try {
        return await repositories.investmentRepository.updateAsset(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.updateInvestmentAssetUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.update_asset_use_case",
  };
}

export default updateInvestmentAssetUseCase;
