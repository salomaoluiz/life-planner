import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface DeleteOccurrenceUseCaseParams {
  // The second confirmation of the paid warning (spec 034 FR 31).
  confirmPaid?: boolean;
  occurrenceNumber: number;
  recurrenceId: string;
  scope: "ONLY_THIS" | "THIS_AND_NEXT";
}

// "Only this one" and "This and the next ones" of a recurring occurrence, real or projected.
function deleteOccurrenceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<DeleteOccurrenceUseCaseParams, void> {
  return {
    execute: async (params) => {
      try {
        await repositories.financialRepository.recurrence.deleteOccurrence(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.deleteOccurrenceUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.delete_occurrence_use_case",
  };
}

export default deleteOccurrenceUseCase;
