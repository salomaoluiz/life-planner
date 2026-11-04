import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import {
  recentTransactionsRange,
  TransactionDateRange,
} from "@domain/entities/financial/TransactionQueryFilter";
import Repositories from "@domain/repositories";

export interface GetTransactionsUseCaseParams {
  ownerIds: string[];
  // Only this period (account rows by date, card purchases by invoice list date); omitted → the whole history.
  // Default: the recent window (spec 078: the API never lists the whole history).
  range?: TransactionDateRange;
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
            params.range ?? recentTransactionsRange(new Date()),
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
