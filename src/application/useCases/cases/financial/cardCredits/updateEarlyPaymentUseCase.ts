import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { UpdateEarlyPaymentRepositoryParams } from "@domain/repositories/financial";

import { assertCredit } from "./validation";

function updateEarlyPaymentUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateEarlyPaymentRepositoryParams, void> {
  return {
    execute: async (params) => {
      assertCredit(params);

      try {
        await repositories.financialRepository.cardCredit.updateEarlyPayment(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.updateEarlyPaymentUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.update_early_payment_use_case",
  };
}

export default updateEarlyPaymentUseCase;
