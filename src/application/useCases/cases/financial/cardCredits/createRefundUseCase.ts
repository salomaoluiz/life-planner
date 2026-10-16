import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { CreateRefundRepositoryParams } from "@domain/repositories/financial";

import { assertCredit } from "./validation";

function createRefundUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateRefundRepositoryParams, void> {
  return {
    execute: async (params) => {
      assertCredit(params);

      try {
        await repositories.financialRepository.cardCredit.createRefund(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.createRefundUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.create_refund_use_case",
  };
}

export default createRefundUseCase;
