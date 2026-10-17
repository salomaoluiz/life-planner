import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { CreateEarlyPaymentRepositoryParams } from "@domain/repositories/financial";

import { assertCredit } from "./validation";

function createEarlyPaymentUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateEarlyPaymentRepositoryParams, void> {
  return {
    execute: async (params) => {
      assertCredit(params);

      if ((params.method === "ACCOUNT") !== (params.accountId !== undefined)) {
        throw new FieldInvalid({ accountId: params.accountId });
      }

      try {
        await repositories.financialRepository.cardCredit.createEarlyPayment(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.createEarlyPaymentUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.create_early_payment_use_case",
  };
}

export default createEarlyPaymentUseCase;
