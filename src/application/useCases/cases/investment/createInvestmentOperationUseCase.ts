import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentOperationResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateInvestmentOperationParams } from "@domain/repositories/investment";

function createInvestmentOperationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateInvestmentOperationParams,
  InvestmentOperationResult
> {
  return {
    execute: async (params: CreateInvestmentOperationParams) => {
      try {
        return await repositories.investmentRepository.createOperation(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.createInvestmentOperationUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.create_operation_use_case",
  };
}

export default createInvestmentOperationUseCase;
