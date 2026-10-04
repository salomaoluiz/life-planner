import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

interface Params {
  email: string;
  password: string;
}

function loginWithEmailUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<Params, void> {
  return {
    execute: async (params) => {
      try {
        await repositories.loginRepository.loginWithEmail({
          email: params.email.trim().toLowerCase(),
          password: params.password,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "loginWithEmailUseCase" });
        }
        throw error;
      }
    },
    uniqueName: "auth.login_with_email_use_case",
  };
}

export default loginWithEmailUseCase;
