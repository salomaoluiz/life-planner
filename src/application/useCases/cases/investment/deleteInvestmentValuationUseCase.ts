import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function deleteInvestmentValuationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  return {
    execute: async (params: string) => {
      try {
        return await repositories.investmentRepository.deleteValuation(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.deleteInvestmentValuationUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.delete_valuation_use_case",
  };
}

export default deleteInvestmentValuationUseCase;
