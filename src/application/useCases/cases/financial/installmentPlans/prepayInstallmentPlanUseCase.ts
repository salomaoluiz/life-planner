import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface PrepayInstallmentPlanUseCaseParams {
  // `YYYY-MM-DD`
  date: string;
  // Cents; omitted or 0 = no discount.
  discount?: number;
  planId: string;
  // `YYYY-MM`
  targetInvoiceMonth: string;
}

// Moves every remaining installment into one invoice, with an optional discount (spec 032 FR 11-16).
function prepayInstallmentPlanUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  PrepayInstallmentPlanUseCaseParams,
  InstallmentPlanDTO
> {
  return {
    execute: async (params) => {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(params.targetInvoiceMonth)) {
        throw new FieldInvalid({
          targetInvoiceMonth: params.targetInvoiceMonth,
        });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
        throw new FieldInvalid({ date: params.date });
      }

      if (
        params.discount !== undefined &&
        (!Number.isInteger(params.discount) || params.discount < 0)
      ) {
        throw new FieldInvalid({ discount: params.discount });
      }

      try {
        const plan =
          await repositories.financialRepository.installmentPlan.prepayInstallmentPlan(
            params,
          );

        return InstallmentPlanDTO.fromEntity(plan);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.prepayInstallmentPlanUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.prepay_installment_plan_use_case",
  };
}

export default prepayInstallmentPlanUseCase;
