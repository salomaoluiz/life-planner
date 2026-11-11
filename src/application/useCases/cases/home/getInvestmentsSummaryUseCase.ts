import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvestmentsHomeSummary } from "@domain/entities/investment/InvestmentEntities";
import Repositories from "@domain/repositories";
import { GetInvestmentsHomeSummaryParams } from "@domain/repositories/investment";

export type GetInvestmentsSummaryUseCaseParams =
  GetInvestmentsHomeSummaryParams;

// Spec 109: one call to GET /v1/investments/summary. Never cached here (money data); React Query caches the read.
function getInvestmentsSummaryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetInvestmentsSummaryUseCaseParams,
  InvestmentsHomeSummary
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.investmentRepository.getHomeSummary({
          ownerIds: params.ownerIds,
          today: params.today,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "home.getInvestmentsSummaryUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "home.get_investments_summary_use_case",
  };
}

export default getInvestmentsSummaryUseCase;
