import loginWithEmailUseCase from "@application/useCases/cases/auth/loginWithEmailUseCase";
import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

const defaultParams = { email: "test@example.com", password: "password123" };

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params: Partial<typeof defaultParams> = {}) {
  return loginWithEmailUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params: Partial<typeof defaultParams> = {}) {
  try {
    await setup(params);
  } catch (error) {
    return error;
  }
}

const spies = {
  loginRepository: jest.mocked(repositoriesMocks.loginRepository),
};

const mocks = { defaultParams };

export { mocks, setup, setupThrowable, spies };
