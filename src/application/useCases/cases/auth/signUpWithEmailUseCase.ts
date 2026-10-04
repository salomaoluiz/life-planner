import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { AutoLoginFailedError, DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

interface Params {
  email: string;
  name: string;
  password: string;
}

function signUpWithEmailUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<Params, void> {
  return {
    execute: async (params) => {
      const email = params.email.trim().toLowerCase();

      try {
        await repositories.loginRepository.signUpWithEmail({
          email,
          name: params.name.trim(),
          password: params.password,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "signUpWithEmailUseCase" });
        }
        throw error;
      }

      try {
        await repositories.loginRepository.loginWithEmail({
          email,
          password: params.password,
        });
      } catch (error) {
        const autoLoginError = new AutoLoginFailedError();
        autoLoginError.addContext({
          cause: error instanceof Error ? error.name : "unknown",
          useCase: "signUpWithEmailUseCase",
        });
        throw autoLoginError;
      }
    },
    uniqueName: "auth.sign_up_with_email_use_case",
  };
}

export default signUpWithEmailUseCase;
