import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetTransactionsUseCaseParams {
  ownerIds: string[];
}

function getTransactionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetTransactionsUseCaseParams,
  TransactionDTO[]
> {
  return {
    execute: async (params) => {
      try {
        const [transactions, categories, accounts] = await Promise.all([
          repositories.financialRepository.transaction.getTransactions(
            params.ownerIds,
          ),
          repositories.financialRepository.category.getCategories(
            params.ownerIds,
          ),
          repositories.financialRepository.account.getAccounts(params.ownerIds),
        ]);

        return transactions.map((transaction) => {
          const category = categories.find(
            (c) => c.id === transaction.categoryId,
          );
          const account = accounts.find((a) => a.id === transaction.accountId);
          return TransactionDTO.fromEntity(
            transaction,
            category?.name,
            account?.name,
          );
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.getTransactionsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.get_transactions_use_case",
  };
}

export default getTransactionsUseCase;
