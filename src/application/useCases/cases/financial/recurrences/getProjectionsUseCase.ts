import ProjectedOccurrenceDTO from "@application/dto/financial/ProjectedOccurrenceDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { TransactionQueryFilter } from "@domain/entities/financial/TransactionQueryFilter";
import Repositories from "@domain/repositories";

export interface GetProjectionsUseCaseParams {
  filter?: TransactionQueryFilter;
  // `YYYY-MM`, at most 12 months from `from` to `to`.
  from: string;
  ownerIds: string[];
  to: string;
}

function getProjectionsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetProjectionsUseCaseParams,
  ProjectedOccurrenceDTO[]
> {
  return {
    execute: async (params) => {
      try {
        const items =
          await repositories.financialRepository.recurrence.getProjections(
            params,
          );

        return items.map((item) => ProjectedOccurrenceDTO.fromEntity(item));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getProjectionsUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "financial.get_projections_use_case",
  };
}

export default getProjectionsUseCase;
