import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface DeleteRecurrenceUseCaseParams {
  confirmPaid?: boolean;
  id: string;
}

// "All": the series and every occurrence. Paid ones answer RecurrenceHasPaidOccurrences until confirmed.
function deleteRecurrenceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  DeleteRecurrenceUseCaseParams,
  { deleted: number; detached: number }
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.financialRepository.recurrence.deleteRecurrence(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.deleteRecurrenceUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.delete_recurrence_use_case",
  };
}

export default deleteRecurrenceUseCase;
