import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function getInstallmentPlanUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string, InstallmentPlanDTO> {
  return {
    execute: async (id) => {
      try {
        const plan =
          await repositories.financialRepository.installmentPlan.getInstallmentPlan(
            id,
          );

        return InstallmentPlanDTO.fromEntity(plan);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getInstallmentPlanUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.get_installment_plan_use_case",
  };
}

export default getInstallmentPlanUseCase;
