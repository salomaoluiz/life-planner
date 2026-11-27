import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import {
  ActivityFilters,
  ActivityPageEntity,
} from "@domain/entities/activity/ActivityEntity";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 127.
function getActivityUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<ActivityFilters, ActivityPageEntity> {
  return {
    execute: async (params) => {
      try {
        return await repositories.activityRepository.getActivity(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "activity.getActivityUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "activity.get_activity_use_case",
  };
}

export default getActivityUseCase;
