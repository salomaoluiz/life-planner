import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { CreditCardBrand } from "@domain/entities/financial/CreditCardEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface UpdateCreditCardUseCaseParams {
  brand?: string;
  closingDay?: number;
  color?: string;
  dueDay?: number;
  id: string;
  lastDigits?: null | string;
  limit?: number;
  owner?: string;
  ownerId?: string;
  paymentAccountId?: null | string;
  paymentDay?: null | number;
  status?: string;
  title?: string;
}

function updateCreditCardUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateCreditCardUseCaseParams, void> {
  return {
    execute: async (params: UpdateCreditCardUseCaseParams) => {
      const owner =
        params.owner === undefined
          ? undefined
          : OwnerType[params.owner as keyof typeof OwnerType];
      const brand =
        params.brand === undefined
          ? undefined
          : CreditCardBrand[params.brand as keyof typeof CreditCardBrand];

      if (params.owner !== undefined && !owner) {
        throw new FieldInvalid({ owner: params.owner });
      }
      if (params.brand !== undefined && !brand) {
        throw new FieldInvalid({ brand: params.brand });
      }

      try {
        await repositories.financialRepository.creditCard.updateCreditCard({
          brand,
          closingDay: params.closingDay,
          color: params.color,
          dueDay: params.dueDay,
          id: params.id,
          lastDigits: params.lastDigits,
          limit: params.limit,
          owner,
          ownerId: params.ownerId,
          paymentAccountId: params.paymentAccountId,
          paymentDay: params.paymentDay,
          status: params.status,
          title: params.title,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.updateCreditCardUseCase" });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.update_credit_card_use_case",
  };
}

export default updateCreditCardUseCase;
