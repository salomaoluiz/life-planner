import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Brings the installments back to their invoices and removes the discount (spec 032 FR 17).
function undoPrepaymentUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  return {
    execute: async (planId) => {
      try {
        await repositories.financialRepository.installmentPlan.undoPrepayment(
          planId,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.undoPrepaymentUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.undo_prepayment_use_case",
  };
}

export default undoPrepaymentUseCase;
