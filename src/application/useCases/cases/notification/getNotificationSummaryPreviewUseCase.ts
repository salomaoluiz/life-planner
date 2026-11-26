import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { NotificationSummaryPreview } from "@domain/entities/notification/NotificationEntity";
import Repositories from "@domain/repositories";

// Spec 124.
function getNotificationSummaryPreviewUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<NotificationSummaryPreview> {
  return {
    execute: async () => {
      try {
        return await repositories.notificationRepository.getSummaryPreview();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "notification.getNotificationSummaryPreviewUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "notification.get_notification_summary_preview_use_case",
  };
}

export default getNotificationSummaryPreviewUseCase;
