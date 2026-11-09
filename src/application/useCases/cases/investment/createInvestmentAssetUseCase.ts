import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateInvestmentAssetParams } from "@domain/repositories/investment";

function createInvestmentAssetUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateInvestmentAssetParams,
  InvestmentAsset
> {
  return {
    execute: async (params: CreateInvestmentAssetParams) => {
      try {
        return await repositories.investmentRepository.createAsset(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.createInvestmentAssetUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.create_asset_use_case",
  };
}

export default createInvestmentAssetUseCase;
