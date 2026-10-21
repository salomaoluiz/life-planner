import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { TransactionQueryFilter } from "@domain/entities/financial/TransactionQueryFilter";
import Repositories from "@domain/repositories";

export interface GetFilteredTransactionsUseCaseParams {
  filter: TransactionQueryFilter;
  ownerIds: string[];
}

// Spec 045: the account rows that match the filters of the Transactions screen.
function getFilteredTransactionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetFilteredTransactionsUseCaseParams,
  TransactionDTO[]
> {
  return {
    execute: async (params) => {
      try {
        const [transactions, categories, accounts] = await Promise.all([
          repositories.financialRepository.transaction.getFilteredTransactions({
            filter: params.filter,
            ownerIds: params.ownerIds,
          }),
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
            useCase: "financial.getFilteredTransactionsUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.get_filtered_transactions_use_case",
  };
}

export default getFilteredTransactionsUseCase;
