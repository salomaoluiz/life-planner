import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 124.
function markAllNotificationsReadUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<void> {
  return {
    execute: async () => {
      try {
        return await repositories.notificationRepository.markAllRead();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.markAllNotificationsReadUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.mark_all_notifications_read_use_case",
  };
}

export default markAllNotificationsReadUseCase;
