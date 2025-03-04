import * as monitoring from "@infrastructure/monitoring";
import getUserUseCase from "@application/useCases/cases/user/getUserUseCase";
import { repositoriesMocks } from "@data/repositories/mocks";

const captureExceptionSpy = jest.spyOn(monitoring, "captureException");

const getUserSpy = jest.fn();

const repositories = {
  ...repositoriesMocks,
  userRepository: {
    ...repositoriesMocks.userRepository,
    getUser: getUserSpy,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return getUserUseCase(repositories);
}

export { setup, captureExceptionSpy, getUserSpy };
