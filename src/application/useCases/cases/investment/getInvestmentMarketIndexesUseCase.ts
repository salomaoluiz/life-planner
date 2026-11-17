import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentMarketIndexes } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";

// Spec 113: the stored CDI, Selic, IPCA and FX values. Never cached here (React Query caches the read).
function getInvestmentMarketIndexesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<InvestmentMarketIndexes> {
  return {
    execute: async () => {
      try {
        return await repositories.investmentRepository.getMarketIndexes();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "investment.getInvestmentMarketIndexesUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "investment.get_market_indexes_use_case",
  };
}

export default getInvestmentMarketIndexesUseCase;
