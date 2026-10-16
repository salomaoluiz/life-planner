import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function deleteInstallmentPlanUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, void> {
  return {
    execute: async (id) => {
      try {
        await repositories.financialRepository.installmentPlan.deleteInstallmentPlan(
          id,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.deleteInstallmentPlanUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.delete_installment_plan_use_case",
  };
}

export default deleteInstallmentPlanUseCase;
