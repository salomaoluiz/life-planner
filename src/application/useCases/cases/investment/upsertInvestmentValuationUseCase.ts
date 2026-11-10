import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentValuationResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { UpsertInvestmentValuationParams } from "@domain/repositories/investment";

function upsertInvestmentValuationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpsertInvestmentValuationParams,
  InvestmentValuationResult
> {
  return {
    execute: async (params: UpsertInvestmentValuationParams) => {
      try {
        return await repositories.investmentRepository.upsertValuation(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.upsertInvestmentValuationUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.upsert_valuation_use_case",
  };
}

export default upsertInvestmentValuationUseCase;
