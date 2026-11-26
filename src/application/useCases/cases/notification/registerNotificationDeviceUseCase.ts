import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { RegisterNotificationDeviceInput } from "@domain/entities/notification/NotificationEntity";
import Repositories from "@domain/repositories";

// Spec 124.
function registerNotificationDeviceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  RegisterNotificationDeviceInput,
  { id: string }
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.notificationRepository.registerDevice(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.registerNotificationDeviceUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.register_notification_device_use_case",
  };
}

export default registerNotificationDeviceUseCase;
