import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface CreateTransactionUseCaseParams {
  category: string;
  date: string;
  description: string;
  owner: string;
  ownerId: string;
  type: string;
  value: string;
}

function createTransactionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<CreateTransactionUseCaseParams, void> {
  return {
    execute: async (params: CreateTransactionUseCaseParams) => {
      const owner = OwnerType[params.owner as keyof typeof OwnerType];
      const type = TransactionType[params.type as keyof typeof TransactionType];

      if (!owner) {
        throw new FieldInvalid({ owner });
      }

      if (!type) {
        throw new FieldInvalid({ type });
      }

      try {
        await repositories.financialRepository.transaction.createTransaction({
          category: params.category,
          date: params.date,
          description: params.description,
          owner,
          ownerId: params.ownerId,
          type,
          value: params.value,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.createTransactionUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.create_transaction_use_case",
  };
}

export default createTransactionUseCase;
