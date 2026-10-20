import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface MaterializeOccurrenceUseCaseParams {
  categoryId?: string;
  date?: string;
  description?: string;
  occurrenceNumber: number;
  paid?: boolean;
  recurrenceId: string;
  tags?: string[];
  value?: string;
}

// "Only this one" on a PROJECTED occurrence: it becomes a real (unpaid) row with the edits (spec 034 FR 21).
function materializeOccurrenceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  MaterializeOccurrenceUseCaseParams,
  TransactionDTO
> {
  return {
    execute: async (params) => {
      try {
        const transaction =
          await repositories.financialRepository.recurrence.materializeOccurrence(
            params,
          );

        return TransactionDTO.fromEntity(transaction);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.materializeOccurrenceUseCase",
          });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.materialize_occurrence_use_case",
  };
}

export default materializeOccurrenceUseCase;
