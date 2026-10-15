import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function getCreditCardsOverviewUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string[], CreditCardOverviewDTO> {
  return {
    execute: async (ownerIds: string[]) => {
      try {
        const overview =
          await repositories.financialRepository.creditCard.getCreditCardsOverview(
            ownerIds,
          );

        return CreditCardOverviewDTO.fromEntity(overview);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.getCreditCardsOverviewUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.get_credit_cards_overview_use_case",
  };
}

export default getCreditCardsOverviewUseCase;
