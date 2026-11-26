import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 124.
function deleteNotificationDeviceUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<{ id: string }, void> {
  return {
    execute: async (params) => {
      try {
        return await repositories.notificationRepository.deleteDevice(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.deleteNotificationDeviceUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.delete_notification_device_use_case",
  };
}

export default deleteNotificationDeviceUseCase;
