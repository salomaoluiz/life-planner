import RecurrenceResultDTO from "@application/dto/financial/RecurrenceResultDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import {
  isRecurrenceFrequency,
  RecurrenceFrequency,
} from "@domain/entities/financial/RecurrenceEntity";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

export interface CreateRecurrenceUseCaseParams {
  accountId?: string;
  categoryId: string;
  creditCardId?: string;
  // ISO date-time of occurrence 1.
  date: string;
  description: string;
  // ISO date-time; omitted = no end date.
  endDate?: string;
  frequency: RecurrenceFrequency;
  notes?: null | string;
  owner: string;
  ownerId: string;
  // Occurrence 1 of an account series only.
  paid?: boolean;
  projected?: boolean;
  tags?: string[];
  type: string;
  value: string;
}

function createRecurrenceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  CreateRecurrenceUseCaseParams,
  RecurrenceResultDTO
> {
  return {
    execute: async (params) => {
      const owner = OwnerType[params.owner as keyof typeof OwnerType];
      const type = TransactionType[params.type as keyof typeof TransactionType];
      if (!owner) {
        throw new FieldInvalid({ owner: params.owner });
      }
      if (!type) {
        throw new FieldInvalid({ type: params.type });
      }
      if (!isRecurrenceFrequency(params.frequency)) {
        throw new FieldInvalid({ frequency: params.frequency });
      }
      if (params.endDate && new Date(params.endDate) < new Date(params.date)) {
        throw new FieldInvalid({ endDate: params.endDate });
      }

      try {
        const result =
          await repositories.financialRepository.recurrence.createRecurrence({
            accountId: params.accountId,
            categoryId: params.categoryId,
            creditCardId: params.creditCardId,
            date: params.date,
            description: params.description,
            endDate: params.endDate,
            frequency: params.frequency,
            notes: params.notes,
            owner,
            ownerId: params.ownerId,
            paid: params.paid,
            projected: params.projected,
            tags: params.tags,
            type,
            value: params.value,
          });

        return RecurrenceResultDTO.fromEntity(result);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.createRecurrenceUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.create_recurrence_use_case",
  };
}

export default createRecurrenceUseCase;
