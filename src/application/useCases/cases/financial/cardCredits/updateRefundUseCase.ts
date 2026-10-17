import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { UpdateRefundRepositoryParams } from "@domain/repositories/financial";

import { assertCredit } from "./validation";

function updateRefundUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateRefundRepositoryParams, void> {
  return {
    execute: async (params) => {
      assertCredit(params);

      try {
        await repositories.financialRepository.cardCredit.updateRefund(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.updateRefundUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.update_refund_use_case",
  };
}

export default updateRefundUseCase;
