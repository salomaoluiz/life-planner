import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import {
  NotificationFilters,
  NotificationPageEntity,
} from "@domain/entities/notification/NotificationEntity";
import Repositories from "@domain/repositories";

// Spec 124.
function getNotificationsUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  NotificationFilters,
  NotificationPageEntity
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.notificationRepository.getNotifications(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "notification.getNotificationsUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "notification.get_notifications_use_case",
  };
}

export default getNotificationsUseCase;
