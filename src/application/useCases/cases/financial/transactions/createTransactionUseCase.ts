import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

// Spec 061: the id lets the list tell the created row from its pending copy.
export interface CreatedTransaction {
  id: string;
}

export interface CreateTransactionUseCaseParams {
  // Exactly one of accountId / creditCardId (a card purchase has no account).
  accountId?: string;
  category: string;
  categoryId: string;
  creditCardId?: string;
  date: string;
  description: string;
  notes?: null | string;
  owner: string;
  ownerId: string;
  paid?: boolean;
  tags?: string[];
  type: string;
  value: string;
}

function createTransactionUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateTransactionUseCaseParams,
  CreatedTransaction
> {
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
        const created =
          await repositories.financialRepository.transaction.createTransaction({
            accountId: params.accountId,
            category: params.category,
            categoryId: params.categoryId,
            creditCardId: params.creditCardId,
            date: params.date,
            description: params.description,
            notes: params.notes,
            owner,
            ownerId: params.ownerId,
            paid: params.paid,
            tags: params.tags,
            type,
            value: params.value,
          });

        return { id: created.id };
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
