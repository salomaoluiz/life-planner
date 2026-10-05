import RecentTransactionDTO from "@application/dto/home/RecentTransactionDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";
import { decimalStringToCents } from "@utils/money";

export const DEFAULT_RECENT_LIMIT = 5;

export interface GetRecentTransactionsUseCaseParams {
  limit?: number;
  ownerIds: string[];
}

function getRecentTransactionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetRecentTransactionsUseCaseParams,
  RecentTransactionDTO[]
> {
  return {
    execute: async (params) => {
      try {
        const [transactions, categories] = await Promise.all([
          repositories.financialRepository.transaction.getTransactions(
            params.ownerIds,
          ),
          repositories.financialRepository.category.getCategories(
            params.ownerIds,
          ),
        ]);

        // Newest first. Array.sort is stable, so the same date keeps the
        // repository order (the API already returns createdAt descending).
        return [...transactions]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, params.limit ?? DEFAULT_RECENT_LIMIT)
          .map((transaction) => {
            const category = categories.find(
              (c) => c.id === transaction.categoryId,
            );

            return new RecentTransactionDTO({
              categoryColor: category?.iconColor,
              categoryIcon: category?.icon,
              categoryName: category?.name ?? transaction.category,
              date: transaction.date,
              description: transaction.description,
              id: transaction.id,
              type: transaction.type,
              value: decimalStringToCents(transaction.value),
            });
          });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "home.getRecentTransactionsUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "home.get_recent_transactions_use_case",
  };
}

export default getRecentTransactionsUseCase;
