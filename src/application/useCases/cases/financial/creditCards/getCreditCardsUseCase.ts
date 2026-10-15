import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function getCreditCardsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string[], CreditCardDTO[]> {
  return {
    execute: async (ownerIds: string[]) => {
      try {
        const cards =
          await repositories.financialRepository.creditCard.getCreditCards(
            ownerIds,
          );

        return cards.map((card) => CreditCardDTO.fromEntity(card));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getCreditCardsUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.get_credit_cards_use_case",
  };
}

export default getCreditCardsUseCase;
