import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export const MAX_INSTALLMENTS = 48;
export const MIN_INSTALLMENTS = 2;

export interface CreateInstallmentPlanUseCaseParams {
  categoryId: string;
  creditCardId: string;
  date: string;
  description: string;
  installments: number;
  notes?: null | string;
  owner: string;
  ownerId: string;
  tags?: string[];
  // The TOTAL, decimal string.
  value: string;
}

function createInstallmentPlanUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateInstallmentPlanUseCaseParams,
  InstallmentPlanDTO
> {
  return {
    execute: async (params) => {
      const owner = OwnerType[params.owner as keyof typeof OwnerType];

      if (!owner) {
        throw new FieldInvalid({ owner: params.owner });
      }

      if (
        !Number.isInteger(params.installments) ||
        params.installments < MIN_INSTALLMENTS ||
        params.installments > MAX_INSTALLMENTS
      ) {
        throw new FieldInvalid({ installments: params.installments });
      }

      try {
        const plan =
          await repositories.financialRepository.installmentPlan.createInstallmentPlan(
            {
              categoryId: params.categoryId,
              creditCardId: params.creditCardId,
              date: params.date,
              description: params.description,
              installments: params.installments,
              notes: params.notes,
              owner,
              ownerId: params.ownerId,
              tags: params.tags,
              value: params.value,
            },
          );

        return InstallmentPlanDTO.fromEntity(plan);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.createInstallmentPlanUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.create_installment_plan_use_case",
  };
}

export default createInstallmentPlanUseCase;
