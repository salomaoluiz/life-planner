import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import {
  MAX_INSTALLMENTS,
  MIN_INSTALLMENTS,
} from "./createInstallmentPlanUseCase";

export interface UpdateInstallmentPlanUseCaseParams {
  categoryId?: string;
  creditCardId?: string;
  date?: string;
  description?: string;
  id: string;
  installments?: number;
  // The new TOTAL, decimal string.
  value?: string;
}

function updateInstallmentPlanUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateInstallmentPlanUseCaseParams,
  InstallmentPlanDTO
> {
  return {
    execute: async (params) => {
      if (
        params.installments !== undefined &&
        (!Number.isInteger(params.installments) ||
          params.installments < MIN_INSTALLMENTS ||
          params.installments > MAX_INSTALLMENTS)
      ) {
        throw new FieldInvalid({ installments: params.installments });
      }

      try {
        const plan =
          await repositories.financialRepository.installmentPlan.updateInstallmentPlan(
            {
              categoryId: params.categoryId,
              creditCardId: params.creditCardId,
              date: params.date,
              description: params.description,
              id: params.id,
              installments: params.installments,
              value: params.value,
            },
          );

        return InstallmentPlanDTO.fromEntity(plan);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.updateInstallmentPlanUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.update_installment_plan_use_case",
  };
}

export default updateInstallmentPlanUseCase;
