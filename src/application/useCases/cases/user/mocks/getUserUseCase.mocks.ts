import getUserUseCase from "@application/useCases/cases/user/getUserUseCase";
import { repositoriesMocks } from "@data/repositories/mocks";
import { BusinessError } from "@domain/entities/errors";
import UserEntityFixture from "@domain/entities/user/mocks/UserEntity.fixture";

// region mocks
const userEntity = new UserEntityFixture().withDefault().build();

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any context",
});

// endregion mocks

// region spies
const userRepositorySpy = jest.mocked(repositoriesMocks.userRepository);
userRepositorySpy.getUser.mockResolvedValue(userEntity);

// region repositories

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getUserUseCase(repositoriesMocks).execute();
}

async function setupThrowable() {
  try {
    await setup();
  } catch (err) {
    return err;
  }
}

const spies = {
  userRepository: userRepositorySpy,
};

const mocks = {
  errors: {
    business: businessError,
    unknown: unknownError,
  },
  userEntity,
};

export { mocks, setup, setupThrowable, spies };
