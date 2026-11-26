import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 124.
function sendTestNotificationUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<{ deviceId?: string }, void> {
  return {
    execute: async (params) => {
      try {
        return await repositories.notificationRepository.sendTest(params);
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.sendTestNotificationUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.send_test_notification_use_case",
  };
}

export default sendTestNotificationUseCase;
