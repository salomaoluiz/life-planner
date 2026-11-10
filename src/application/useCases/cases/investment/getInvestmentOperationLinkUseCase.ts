import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { InvestmentOperationLink } from "@domain/repositories/investment";

function getInvestmentOperationLinkUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  string,
  InvestmentOperationLink | undefined
> {
  return {
    execute: async (params: string) => {
      try {
        return await repositories.investmentRepository.getOperationLink(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentOperationLinkUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_operation_link_use_case",
  };
}

export default getInvestmentOperationLinkUseCase;
