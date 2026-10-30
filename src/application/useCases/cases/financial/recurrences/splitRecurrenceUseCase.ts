import RecurrenceResultDTO from "@application/dto/financial/RecurrenceResultDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError, FieldInvalid } from "@domain/entities/errors";
import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import Repositories from "@domain/repositories";

import { RECURRENCE_FREQUENCIES } from "./createRecurrenceUseCase";

export interface SplitRecurrenceUseCaseParams {
  accountId?: string;
  categoryId?: string;
  creditCardId?: string;
  description?: string;
  // `null` removes the end date; omitted keeps it.
  endDate?: null | string;
  frequency?: string;
  notes?: null | string;
  occurrenceNumber: number;
  recurrenceId: string;
  tags?: string[];
  value?: string;
}

// "This and the next ones": the series splits at the occurrence (spec 034 FR 22).
function splitRecurrenceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  SplitRecurrenceUseCaseParams,
  RecurrenceResultDTO
> {
  return {
    execute: async (params) => {
      let frequency: RecurrenceFrequency | undefined;

      if (params.frequency !== undefined) {
        frequency = RECURRENCE_FREQUENCIES.find(
          (item) => item === params.frequency,
        );

        if (!frequency) {
          throw new FieldInvalid({ frequency: params.frequency });
        }
      }

      try {
        const result =
          await repositories.financialRepository.recurrence.splitRecurrence({
            ...params,
            frequency,
          });

        return RecurrenceResultDTO.fromEntity(result);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.splitRecurrenceUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.split_recurrence_use_case",
  };
}

export default splitRecurrenceUseCase;
