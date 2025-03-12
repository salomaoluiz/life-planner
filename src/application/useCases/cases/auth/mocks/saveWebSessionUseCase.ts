import saveWebSessionUseCase from "@application/useCases/cases/auth/saveWebSessionUseCase";
import { repositoriesMocks } from "@data/repositories/mocks";
import Repositories from "@domain/repositories";

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

async function setup(hash?: string) {
  return saveWebSessionUseCase(repositories).execute(hash);
}

export { saveSessionSpy, setup };
