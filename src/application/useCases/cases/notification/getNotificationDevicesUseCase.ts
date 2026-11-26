import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { NotificationDeviceEntity } from "@domain/entities/notification/NotificationEntity";
import Repositories from "@domain/repositories";

// Spec 124.
function getNotificationDevicesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<NotificationDeviceEntity[]> {
  return {
    execute: async () => {
      try {
        return await repositories.notificationRepository.getDevices();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.getNotificationDevicesUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.get_notification_devices_use_case",
  };
}

export default getNotificationDevicesUseCase;
