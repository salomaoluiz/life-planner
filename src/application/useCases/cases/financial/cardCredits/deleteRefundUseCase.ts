import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { CardCreditRefRepositoryParams } from "@domain/repositories/financial";

function deleteRefundUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CardCreditRefRepositoryParams, void> {
  return {
    execute: async (params) => {
      try {
        await repositories.financialRepository.cardCredit.deleteRefund(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.deleteRefundUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.delete_refund_use_case",
  };
}

export default deleteRefundUseCase;
