import * as monitoring from "@infrastructure/monitoring";
import loginWithGoogleUseCase from "@application/useCases/cases/auth/loginWithGoogleUseCase";
import { repositoriesMocks } from "@data/repositories/mocks";

const captureExceptionSpy = jest.spyOn(monitoring, "captureException");

const loginWithGoogleSpy = jest.fn();

const repositories = {
  ...repositoriesMocks,
  loginRepository: {
    ...repositoriesMocks.loginRepository,
    loginWithGoogle: loginWithGoogleSpy,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return loginWithGoogleUseCase(repositories);
}

export { setup, captureExceptionSpy, loginWithGoogleSpy };
