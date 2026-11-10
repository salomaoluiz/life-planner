import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { AccountType } from "@domain/entities/financial/AccountEntity";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface CreateAccountUseCaseParams {
  balance: number;
  currency?: CurrencyCode;
  icon: string;
  isFavorite?: boolean;
  name: string;
  owner: string;
  ownerId: string;
  status: string;
  type?: string;
}

function createAccountUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateAccountUseCaseParams, void> {
  return {
    execute: async (params: CreateAccountUseCaseParams) => {
      const owner = OwnerType[params.owner as keyof typeof OwnerType];

      if (!owner) {
        throw new FieldInvalid({ owner });
      }

      const type = toType(params.type);

      try {
        await repositories.financialRepository.account.createAccount({
          balance: params.balance,
          currency: params.currency,
          icon: params.icon,
          isFavorite: params.isFavorite,
          name: params.name,
          owner,
          ownerId: params.ownerId,
          status: params.status,
          type,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.createAccountUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.create_account_use_case",
  };
}

function toType(value: string | undefined): AccountType | undefined {
  if (value === undefined) {
    return undefined;
  }
  const type = AccountType[value as keyof typeof AccountType];

  if (!type) {
    throw new FieldInvalid({ type: value });
  }

  return type;
}

export default createAccountUseCase;
