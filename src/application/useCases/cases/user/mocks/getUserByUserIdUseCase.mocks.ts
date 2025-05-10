import getUserByUserIdUseCase from "@application/useCases/cases/user/getUserByUserIdUseCase";
import { repositoriesMocks } from "@data/repositories/mocks";
import { BusinessError } from "@domain/entities/errors";
import UserEntityFixture from "@domain/entities/user/mocks/UserEntity.fixture";

// region mocks
const defaultParams = "664eb705-c898-4313-9107-7d3f76442767";

const userEntity = new UserEntityFixture()
  .withDefault()
  .withId(defaultParams)
  .build();

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any context",
});

// endregion mocks

// region spies

const userRepositorySpy = jest.mocked(repositoriesMocks.userRepository);
userRepositorySpy.getUserById.mockResolvedValue(userEntity);

// region repositories

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: string) {
  return getUserByUserIdUseCase(repositoriesMocks).execute(
    params ?? defaultParams,
  );
}

async function setupThrowable(params?: string) {
  try {
    await setup(params ?? defaultParams);
  } catch (err) {
    return err;
  }
}

const spies = {
  userRepository: userRepositorySpy,
};

const mocks = {
  defaultParams,
  errors: {
    business: businessError,
    unknown: unknownError,
  },
  userEntity,
};

export { mocks, setup, setupThrowable, spies };
