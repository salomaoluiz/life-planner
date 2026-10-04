import AccountDTO from "@application/dto/financial/AccountDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

function getAccountsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<string[], AccountDTO[]> {
  return {
    execute: async (ownerIds: string[]) => {
      try {
        const accounts =
          await repositories.financialRepository.account.getAccounts(ownerIds);
        return accounts.map((account) => AccountDTO.fromEntity(account));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.getAccountsUseCase",
          });
          throw error;
        }
        throw error;
      }
    },
    uniqueName: "financial.get_accounts_use_case",
  };
}

export default getAccountsUseCase;
