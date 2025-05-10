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
        const transactions =
          await repositories.financialRepository.transaction.getTransactions(
            params.ownerIds,
          );

        return transactions.map((transaction) =>
          TransactionDTO.fromEntity(transaction),
        );
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
