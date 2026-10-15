import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface UndoInvoicePaymentUseCaseParams {
  creditCardId: string;
  // `YYYY-MM`
  month: string;
}

function undoInvoicePaymentUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UndoInvoicePaymentUseCaseParams, void> {
  return {
    execute: async (params) => {
      try {
        await repositories.financialRepository.creditCard.undoInvoicePayment(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.undoInvoicePaymentUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.undo_invoice_payment_use_case",
  };
}

export default undoInvoicePaymentUseCase;
