import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentOperationResult } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { CreateInvestmentFractionSaleParams } from "@domain/repositories/investment";

function createInvestmentFractionSaleUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateInvestmentFractionSaleParams,
  InvestmentOperationResult
> {
  return {
    execute: async (params: CreateInvestmentFractionSaleParams) => {
      try {
        return await repositories.investmentRepository.createFractionSale(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.createInvestmentFractionSaleUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.create_fraction_sale_use_case",
  };
}

export default createInvestmentFractionSaleUseCase;
