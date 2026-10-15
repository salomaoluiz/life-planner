import CardInvoiceDTO from "@application/dto/financial/CardInvoiceDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetCardInvoiceUseCaseParams {
  creditCardId: string;
  // `YYYY-MM`
  month: string;
}

function getCardInvoiceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetCardInvoiceUseCaseParams,
  CardInvoiceDTO
> {
  return {
    execute: async (params) => {
      try {
        const invoice =
          await repositories.financialRepository.creditCard.getCardInvoice(
            params,
          );

        return CardInvoiceDTO.fromEntity(invoice);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getCardInvoiceUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.get_card_invoice_use_case",
  };
}

export default getCardInvoiceUseCase;
