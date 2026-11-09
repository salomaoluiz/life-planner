import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetTransactionByIdUseCaseParams {
  id: string;
  ownerIds: string[];
}

// Spec 077: one row for the edit forms; `null` (a query cannot hold `undefined`) when it is missing or unreadable.
function getTransactionByIdUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetTransactionByIdUseCaseParams,
  null | TransactionDTO
> {
  return {
    execute: async (params) => {
      try {
        const [transaction, categories, accounts] = await Promise.all([
          repositories.financialRepository.transaction.getTransactionById(
            params.id,
          ),
          repositories.financialRepository.category.getCategories(
            params.ownerIds,
          ),
          repositories.financialRepository.account.getAccounts(params.ownerIds),
        ]);

        if (!transaction) {
          return null;
        }

        return TransactionDTO.fromEntity(
          transaction,
          categories.find((c) => c.id === transaction.categoryId)?.name,
          accounts.find((a) => a.id === transaction.accountId)?.name,
          accounts,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getTransactionByIdUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.get_transaction_by_id_use_case",
  };
}

export default getTransactionByIdUseCase;
