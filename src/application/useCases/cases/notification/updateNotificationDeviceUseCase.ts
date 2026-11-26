import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { NotificationDeviceEntity } from "@domain/entities/notification/NotificationEntity";
import Repositories from "@domain/repositories";

// Spec 124.
function updateNotificationDeviceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  { enabled?: boolean; id: string; name?: string },
  NotificationDeviceEntity
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.notificationRepository.updateDevice(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.updateNotificationDeviceUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.update_notification_device_use_case",
  };
}

export default updateNotificationDeviceUseCase;
