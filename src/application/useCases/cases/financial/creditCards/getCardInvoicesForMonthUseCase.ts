import CardInvoiceDTO from "@application/dto/financial/CardInvoiceDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetCardInvoicesForMonthUseCaseParams {
  // `YYYY-MM`
  month: string;
  ownerIds: string[];
}

// The card invoices whose list day (real payment day once paid, else the planned one) is in the month.
function getCardInvoicesForMonthUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetCardInvoicesForMonthUseCaseParams,
  CardInvoiceDTO[]
> {
  return {
    execute: async (params) => {
      try {
        const invoices =
          await repositories.financialRepository.creditCard.getCardInvoicesForMonth(
            params,
          );

        return invoices.map((invoice) => CardInvoiceDTO.fromEntity(invoice));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.getCardInvoicesForMonthUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.get_card_invoices_for_month_use_case",
  };
}

export default getCardInvoicesForMonthUseCase;
