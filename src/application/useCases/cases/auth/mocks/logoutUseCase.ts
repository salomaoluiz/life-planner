import logoutUseCase from "@application/useCases/cases/auth/logoutUseCase";
import { repositoriesMocks } from "@data/repositories/mocks";

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

export { logoutSpy, setup };
