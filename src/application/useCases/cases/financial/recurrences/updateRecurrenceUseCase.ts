import RecurrenceDTO from "@application/dto/financial/RecurrenceDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface UpdateRecurrenceUseCaseParams {
  categoryId?: string;
  description?: string;
  // `null` removes the end date; omitted keeps it.
  endDate?: null | string;
  id: string;
  tags?: string[];
  value?: string;
}

// "All": description, category, value and end date of the whole series (spec 034 FR 20).
function updateRecurrenceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  UpdateRecurrenceUseCaseParams,
  RecurrenceDTO
> {
  return {
    execute: async (params) => {
      try {
        const series =
          await repositories.financialRepository.recurrence.updateRecurrence(
            params,
          );

        return RecurrenceDTO.fromEntity(series);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.updateRecurrenceUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.update_recurrence_use_case",
  };
}

export default updateRecurrenceUseCase;
