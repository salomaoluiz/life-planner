import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import {
  NotificationPreferencesEntity,
  NotificationPreferencesPatch,
} from "@domain/entities/notification/NotificationEntity";
import Repositories from "@domain/repositories";

// Spec 124.
function updateNotificationPreferencesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  NotificationPreferencesPatch,
  NotificationPreferencesEntity
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.notificationRepository.updatePreferences(
          params,
        );
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.updateNotificationPreferencesUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.update_notification_preferences_use_case",
  };
}

export default updateNotificationPreferencesUseCase;
