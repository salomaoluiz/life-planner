import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
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
    const owner = OwnerType[params.owner as keyof typeof OwnerType];
    const type = TransactionType[params.type as keyof typeof TransactionType];

    if (params.owner && !owner) {
      throw new FieldInvalid({ owner: params.owner });
    }

    if (params.type && !type) {
      throw new FieldInvalid({ type: params });
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
