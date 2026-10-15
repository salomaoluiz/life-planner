import deleteAccountUseCase from "@application/useCases/cases/user/deleteAccountUseCase";
import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

// region mocks
const businessError = new BusinessError();
businessError.addContext({ any_context: "any context" });
const unknownError = new Error("Unknown error");
// endregion mocks

// region spies
const userRepositorySpy = jest.mocked(repositoriesMocks.userRepository);
const loginRepositorySpy = jest.mocked(repositoriesMocks.loginRepository);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  userRepositorySpy.deleteAccount.mockResolvedValue(undefined);
  loginRepositorySpy.logout.mockResolvedValue(undefined);
});

async function setup(email = "test@example.com") {
  return deleteAccountUseCase(repositoriesMocks).execute({ email });
}

async function setupThrowable() {
  try {
    await setup();
  } catch (err) {
    return err;
  }
}

const spies = {
  loginRepository: loginRepositorySpy,
  userRepository: userRepositorySpy,
};

const mocks = {
  errors: { business: businessError, unknown: unknownError },
};

export { mocks, setup, setupThrowable, spies };
