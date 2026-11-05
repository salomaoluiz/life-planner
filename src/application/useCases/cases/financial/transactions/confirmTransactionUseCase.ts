import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface ConfirmTransactionUseCaseParams {
  // ISO instant of the day the charge happened.
  date: string;
  id: string;
  // Spec 095 rules; omitted = the invoice of the date.
  invoiceMonth?: string;
  ownerId: string;
  // Decimal text of the amount charged.
  value: string;
}

// Spec 096: a projected card purchase becomes effective with the real value and date.
function confirmTransactionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<ConfirmTransactionUseCaseParams, void> {
  return {
    execute: async (params: ConfirmTransactionUseCaseParams) => {
      try {
        await repositories.financialRepository.transaction.confirmTransaction({
          date: params.date,
          id: params.id,
          invoiceMonth: params.invoiceMonth,
          ownerId: params.ownerId,
          value: params.value,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.confirmTransactionUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "financial.confirm_transaction_use_case",
  };
}

export default confirmTransactionUseCase;
