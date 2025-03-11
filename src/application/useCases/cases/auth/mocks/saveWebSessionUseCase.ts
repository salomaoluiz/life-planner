import * as monitoring from "@infrastructure/monitoring";
import { repositoriesMocks } from "@data/repositories/mocks";
import Repositories from "@domain/repositories";
import saveWebSessionUseCase from "@application/useCases/cases/auth/saveWebSessionUseCase";

const captureExceptionSpy = jest.spyOn(monitoring, "captureException");

const saveSessionSpy = jest.fn();

const repositories: Repositories = {
  ...repositoriesMocks,
  loginRepository: {
    ...repositoriesMocks.loginRepository,
    saveSession: saveSessionSpy,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(hash?: string) {
  return saveWebSessionUseCase(repositories).execute(hash);
}

export { setup, captureExceptionSpy, saveSessionSpy };
