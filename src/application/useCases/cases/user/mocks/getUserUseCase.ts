import getUserUseCase from "@application/useCases/cases/user/getUserUseCase";
import { repositoriesMocks } from "@data/repositories/mocks";
import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

// region mocks
const getUserSuccessResponse = new UserProfileEntity({
  id: "1",
  name: "John Doe",
  email: "john.doe@gmail.com",
  photoUrl: "https://photo.com/john_doe",
});

// endregion mocks

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

const spies = {
  getUser: getUserSpy,
};

const mocks = {
  getUserSuccessResponse,
};
export { setup, spies, mocks };
