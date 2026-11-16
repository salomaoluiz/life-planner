import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function deleteInvestmentConversionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  return {
    execute: async (id: string) => {
      try {
        return await repositories.investmentRepository.deleteConversion(id);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.deleteInvestmentConversionUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.delete_conversion_use_case",
  };
}

export default deleteInvestmentConversionUseCase;
