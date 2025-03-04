import * as monitoring from "@infrastructure/monitoring";
import { repositoriesMocks } from "@data/repositories/mocks";
import logoutUseCase from "@application/useCases/cases/auth/logoutUseCase";

const captureExceptionSpy = jest.spyOn(monitoring, "captureException");

const logoutSpy = jest.fn();

const repositories = {
  ...repositoriesMocks,
  loginRepository: {
    ...repositoriesMocks.loginRepository,
    logout: logoutSpy,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return logoutUseCase(repositories);
}

export { setup, captureExceptionSpy, logoutSpy };
