import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface PayInvoiceUseCaseParams {
  // Required for ACCOUNT, forbidden for EXTERNAL.
  accountId?: string;
  creditCardId: string;
  method: string;
  // `YYYY-MM`
  month: string;
  // `YYYY-MM-DD`
  paidOn: string;
}

function payInvoiceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<PayInvoiceUseCaseParams, void> {
  return {
    execute: async (params) => {
      if (params.method !== "ACCOUNT" && params.method !== "EXTERNAL") {
        throw new FieldInvalid({ method: params.method });
      }
      if ((params.method === "ACCOUNT") !== (params.accountId !== undefined)) {
        throw new FieldInvalid({ accountId: params.accountId });
      }

      try {
        await repositories.financialRepository.creditCard.payInvoice({
          accountId: params.accountId,
          creditCardId: params.creditCardId,
          method: params.method,
          month: params.month,
          paidOn: params.paidOn,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.payInvoiceUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.pay_invoice_use_case",
  };
}

export default payInvoiceUseCase;
