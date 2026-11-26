import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 124.
function getUnreadNotificationCountUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<number> {
  return {
    execute: async () => {
      try {
        return await repositories.notificationRepository.getUnreadCount();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.getUnreadNotificationCountUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.get_unread_notification_count_use_case",
  };
}

export default getUnreadNotificationCountUseCase;
