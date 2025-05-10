import loginWithGoogleUseCase from "@application/useCases/cases/auth/loginWithGoogleUseCase";
import { repositoriesMocks } from "@data/repositories/mocks";
import LoginWithGoogleEntityFixture from "@domain/entities/auth/mocks/LoginWithGoogleEntity.fixture";
import UserEntityFixture from "@domain/entities/user/mocks/UserEntity.fixture";

// region Mocks

const loginWithGoogleEntityMock = new LoginWithGoogleEntityFixture()
  .withDefault()
  .build();
const userEntityMock = new UserEntityFixture().withDefault().build();

// endregion Mocks

// region Spies

// endregion Spies
beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return loginWithGoogleUseCase(repositoriesMocks);
}

const spies = {
  loginRepository: jest.mocked(repositoriesMocks.loginRepository),
  userRepository: jest.mocked(repositoriesMocks.userRepository),
};

const mocks = {
  loginWithGoogleEntity: loginWithGoogleEntityMock,
  userEntity: userEntityMock,
};

export { mocks, setup, spies };
