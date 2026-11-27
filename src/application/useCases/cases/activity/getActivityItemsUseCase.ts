import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import {
  ActivityBatchFilters,
  ActivityBatchPageEntity,
} from "@domain/entities/activity/ActivityEntity";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 127.
function getActivityItemsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  ActivityBatchFilters,
  ActivityBatchPageEntity
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.activityRepository.getActivityItems(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "activity.getActivityItemsUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "activity.get_activity_items_use_case",
  };
}

export default getActivityItemsUseCase;
