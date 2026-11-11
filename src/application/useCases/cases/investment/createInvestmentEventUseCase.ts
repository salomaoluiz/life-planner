import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentOperationResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateInvestmentEventParams } from "@domain/repositories/investment";

function createInvestmentEventUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateInvestmentEventParams,
  InvestmentOperationResult
> {
  return {
    execute: async (params: CreateInvestmentEventParams) => {
      try {
        return await repositories.investmentRepository.createEvent(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.createInvestmentEventUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.create_event_use_case",
  };
}

export default createInvestmentEventUseCase;
