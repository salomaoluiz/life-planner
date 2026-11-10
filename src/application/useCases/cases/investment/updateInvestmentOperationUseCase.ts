import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentOperationResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { UpdateInvestmentOperationParams } from "@domain/repositories/investment";

function updateInvestmentOperationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateInvestmentOperationParams,
  InvestmentOperationResult
> {
  return {
    execute: async (params: UpdateInvestmentOperationParams) => {
      try {
        return await repositories.investmentRepository.updateOperation(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.updateInvestmentOperationUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.update_operation_use_case",
  };
}

export default updateInvestmentOperationUseCase;
