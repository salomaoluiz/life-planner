import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 124.
function markNotificationReadUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<{ id: string }, void> {
  return {
    execute: async (params) => {
      try {
        return await repositories.notificationRepository.markRead(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.markNotificationReadUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.mark_notification_read_use_case",
  };
}

export default markNotificationReadUseCase;
