import UpcomingDTO from "@application/dto/home/UpcomingDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetUpcomingItemsUseCaseParams {
  ownerIds: string[];
}

function getUpcomingItemsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetUpcomingItemsUseCaseParams,
  UpcomingDTO
> {
  return {
    execute: async (params) => {
      try {
        const entity =
          await repositories.financialRepository.upcoming.getUpcoming({
            ownerIds: params.ownerIds,
          });

        return UpcomingDTO.fromEntity(entity);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "home.getUpcomingItemsUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "home.get_upcoming_items_use_case",
  };
}

export default getUpcomingItemsUseCase;
