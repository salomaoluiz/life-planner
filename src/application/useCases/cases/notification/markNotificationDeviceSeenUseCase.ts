import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 124.
function markNotificationDeviceSeenUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  { id: string; locale: string; timeZone: string },
  void
> {
  return {
    execute: async (params) => {
      try {
        return await repositories.notificationRepository.markDeviceSeen(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.markNotificationDeviceSeenUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.mark_notification_device_seen_use_case",
  };
}

export default markNotificationDeviceSeenUseCase;
