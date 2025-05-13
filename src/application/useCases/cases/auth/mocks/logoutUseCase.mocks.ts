import logoutUseCase from "@application/useCases/cases/auth/logoutUseCase";
import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return logoutUseCase(repositoriesMocks);
}

const spies = {
  loginRepository: jest.mocked(repositoriesMocks.loginRepository),
};

export { setup, spies };
