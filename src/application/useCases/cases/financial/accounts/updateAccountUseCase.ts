import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface UpdateAccountUseCaseParams {
  balance?: number;
  icon?: string;
  id: string;
  name?: string;
  owner?: string;
  ownerId?: string;
  status?: string;
}

function updateAccountUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateAccountUseCaseParams, void> {
  return {
    execute: async (params: UpdateAccountUseCaseParams) => {
      try {
        await repositories.financialRepository.account.updateAccount({
          balance: params.balance,
          icon: params.icon,
          id: params.id,
          name: params.name,
          ownerId: params.ownerId,
          status: params.status,
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
