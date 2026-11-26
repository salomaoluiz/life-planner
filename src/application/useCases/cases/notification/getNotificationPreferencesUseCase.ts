import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { NotificationPreferencesEntity } from "@domain/entities/notification/NotificationEntity";
import Repositories from "@domain/repositories";

// Spec 124.
function getNotificationPreferencesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<NotificationPreferencesEntity> {
  return {
    execute: async () => {
      try {
        return await repositories.notificationRepository.getPreferences();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.getNotificationPreferencesUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.get_notification_preferences_use_case",
  };
}

export default getNotificationPreferencesUseCase;
