import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function deleteInvestmentOperationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  return {
    execute: async (params: string) => {
      try {
        return await repositories.investmentRepository.deleteOperation(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.deleteInvestmentOperationUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.delete_operation_use_case",
  };
}

export default deleteInvestmentOperationUseCase;
