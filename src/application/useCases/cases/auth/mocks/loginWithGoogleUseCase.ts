import loginWithGoogleUseCase from "@application/useCases/cases/auth/loginWithGoogleUseCase";
import { repositoriesMocks } from "@data/repositories/mocks";

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

export { loginWithGoogleSpy, setup };
