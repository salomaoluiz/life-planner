import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldRequired } from "@domain/entities/errors";
import {
  TransactionOwners,
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import Repositories from "@domain/repositories";

export interface UpdateTransactionUseCaseParams {
  category?: string;
  date?: string;
  description?: string;
  id: string;
  owner?: string;
  ownerId?: string;
  type?: string;
  value?: string;
}

function updateTransactionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<UpdateTransactionUseCaseParams, void> {
  function validate(params: UpdateTransactionUseCaseParams) {
    const owner =
      TransactionOwners[params.owner as keyof typeof TransactionOwners];
    const type = TransactionType[params.type as keyof typeof TransactionType];

    if (params.owner && !owner) {
      throw new FieldRequired({ owner: params.owner });
    }

    if (params.type && !type) {
      throw new FieldRequired({ type: params });
    }

    if (!params.id) {
      throw new FieldRequired({ id: params.id });
    }

    return { owner, type };
  }

  return {
    execute: async (params: UpdateTransactionUseCaseParams) => {
      try {
        const { owner, type } = validate(params);

        await repositories.financialRepository.transaction.updateTransaction({
          category: params.category,
          date: params.date,
          description: params.description,
          id: params.id,
          owner,
          ownerId: params.ownerId,
          type,
          value: params.value,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.updateTransactionUseCase",
          });
          throw error;
        }

        throw error;
      }
    },

    uniqueName: "financial.update_transaction_use_case",
  };
}

export default updateTransactionUseCase;
