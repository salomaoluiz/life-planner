import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface DeleteCreditCardUseCaseParams {
  id: string;
}

function deleteCreditCardUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteCreditCardUseCaseParams, void> {
  return {
    execute: async (params: DeleteCreditCardUseCaseParams) => {
      try {
        await repositories.financialRepository.creditCard.deleteCreditCard({
          id: params.id,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.deleteCreditCardUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.delete_credit_card_use_case",
  };
}

export default deleteCreditCardUseCase;
