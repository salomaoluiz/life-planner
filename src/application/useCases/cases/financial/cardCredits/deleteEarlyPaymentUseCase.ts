import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { CardCreditRefRepositoryParams } from "@domain/repositories/financial";

function deleteEarlyPaymentUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CardCreditRefRepositoryParams, void> {
  return {
    execute: async (params) => {
      try {
        await repositories.financialRepository.cardCredit.deleteEarlyPayment(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.deleteEarlyPaymentUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.delete_early_payment_use_case",
  };
}

export default deleteEarlyPaymentUseCase;
