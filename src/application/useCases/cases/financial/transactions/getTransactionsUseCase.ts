import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { TransactionDateRange } from "@domain/entities/financial/TransactionQueryFilter";
import Repositories from "@domain/repositories";

export interface GetTransactionsUseCaseParams {
  // Spec 077: only this card's purchases (one request).
  creditCardId?: string;
  ownerIds: string[];
  // Only this period (account rows by date, card purchases by invoice list date). Required: the API never lists the
  // whole history (spec 078) and no screen asks for it (spec 077).
  range: TransactionDateRange;
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
            params.range,
            params.creditCardId
              ? { creditCardId: params.creditCardId }
              : undefined,
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
