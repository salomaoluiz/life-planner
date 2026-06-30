import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface CreateAccountUseCaseParams {
  balance: number;
  icon: string;
  name: string;
  owner: string;
  ownerId: string;
  status: string;
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

      try {
        await repositories.financialRepository.account.createAccount({
          balance: params.balance,
          icon: params.icon,
          name: params.name,
          owner,
          ownerId: params.ownerId,
          status: params.status,
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

export default createAccountUseCase;
