import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetTransactionByIdUseCaseParams {
  id: string;
  ownerIds: string[];
}

// Spec 077: one row for the edit forms; `undefined` when it is missing or the user cannot read it.
function getTransactionByIdUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetTransactionByIdUseCaseParams,
  TransactionDTO | undefined
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
          return undefined;
        }

        return TransactionDTO.fromEntity(
          transaction,
          categories.find((c) => c.id === transaction.categoryId)?.name,
          accounts.find((a) => a.id === transaction.accountId)?.name,
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
