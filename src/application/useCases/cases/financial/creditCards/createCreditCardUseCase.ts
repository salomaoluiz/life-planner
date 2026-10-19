import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { CreditCardBrand } from "@domain/entities/financial/CreditCardEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface CreateCreditCardUseCaseParams {
  brand: string;
  closingDay: number;
  color: string;
  dueDay: number;
  lastDigits?: string;
  limit: number;
  owner: string;
  ownerId: string;
  paymentAccountId?: string;
  paymentDay?: number;
  title: string;
}

function createCreditCardUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateCreditCardUseCaseParams, void> {
  return {
    execute: async (params: CreateCreditCardUseCaseParams) => {
      const owner = OwnerType[params.owner as keyof typeof OwnerType];
      const brand =
        CreditCardBrand[params.brand as keyof typeof CreditCardBrand];

      if (!owner) {
        throw new FieldInvalid({ owner: params.owner });
      }
      if (!brand) {
        throw new FieldInvalid({ brand: params.brand });
      }

      try {
        await repositories.financialRepository.creditCard.createCreditCard({
          brand,
          closingDay: params.closingDay,
          color: params.color,
          dueDay: params.dueDay,
          lastDigits: params.lastDigits,
          limit: params.limit,
          owner,
          ownerId: params.ownerId,
          paymentAccountId: params.paymentAccountId,
          paymentDay: params.paymentDay,
          title: params.title,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.createCreditCardUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.create_credit_card_use_case",
  };
}

export default createCreditCardUseCase;
