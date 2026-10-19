import RecurrenceDTO from "@application/dto/financial/RecurrenceDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetRecurrencesUseCaseParams {
  accountId?: string;
  creditCardId?: string;
  ownerIds?: string[];
  status?: "ACTIVE" | "ENDED";
}

// Series of a source: used by the archive warning ("{{count}} recurring transactions will end").
function getRecurrencesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetRecurrencesUseCaseParams,
  RecurrenceDTO[]
> {
  return {
    execute: async (params) => {
      try {
        const items =
          await repositories.financialRepository.recurrence.getRecurrences(
            params,
          );

        return items.map((item) => RecurrenceDTO.fromEntity(item));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getRecurrencesUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.get_recurrences_use_case",
  };
}

export default getRecurrencesUseCase;
