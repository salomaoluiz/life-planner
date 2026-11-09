import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { AccountType } from "@domain/entities/financial/AccountEntity";
import Repositories from "@domain/repositories";

export interface UpdateAccountUseCaseParams {
  icon?: string;
  id: string;
  isFavorite?: boolean;
  name?: string;
  owner?: string;
  ownerId?: string;
  status?: string;
  type?: string;
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

function updateAccountUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateAccountUseCaseParams, void> {
  return {
    execute: async (params: UpdateAccountUseCaseParams) => {
      const type = toType(params.type);

      try {
        await repositories.financialRepository.account.updateAccount({
          icon: params.icon,
          id: params.id,
          isFavorite: params.isFavorite,
          name: params.name,
          ownerId: params.ownerId,
          status: params.status,
          type,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.updateAccountUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.update_account_use_case",
  };
}

export default updateAccountUseCase;
