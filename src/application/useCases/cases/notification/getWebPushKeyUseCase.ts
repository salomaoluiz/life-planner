import { IUseCaseFactoryWithoutParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

// Spec 124.
function getWebPushKeyUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithoutParamResponse<string> {
  return {
    execute: async () => {
      try {
        return await repositories.notificationRepository.getWebPushKey();
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "notification.getWebPushKeyUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "notification.get_web_push_key_use_case",
  };
}

export default getWebPushKeyUseCase;
