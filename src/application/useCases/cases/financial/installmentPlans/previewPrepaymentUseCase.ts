import PrepaymentPreviewDTO from "@application/dto/financial/PrepaymentPreviewDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface PreviewPrepaymentUseCaseParams {
  planId: string;
  // `YYYY-MM`
  targetInvoiceMonth: string;
}

// What a prepayment into one invoice would move (spec 032 FR 12, 13).
function previewPrepaymentUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  PreviewPrepaymentUseCaseParams,
  PrepaymentPreviewDTO
> {
  return {
    execute: async (params) => {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(params.targetInvoiceMonth)) {
        throw new FieldInvalid({
          targetInvoiceMonth: params.targetInvoiceMonth,
        });
      }

      try {
        const preview =
          await repositories.financialRepository.installmentPlan.previewPrepayment(
            params,
          );

        return PrepaymentPreviewDTO.fromEntity(preview);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.previewPrepaymentUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.preview_prepayment_use_case",
  };
}

export default previewPrepaymentUseCase;
