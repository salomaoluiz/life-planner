import getOwnersUseCase from "@application/useCases/cases/user/getOwnersUseCase";
import { repositoriesMocks } from "@data/repositories/mocks";
import { BusinessError } from "@domain/entities/errors";
import FamilyEntityFixture from "@domain/entities/family/mocks/FamilyEntity.fixture";
import UserEntityFixture from "@domain/entities/user/mocks/UserEntity.fixture";

// region mocks
const userEntityMock = new UserEntityFixture().withDefault().build();
const familyEntityFixture = new FamilyEntityFixture().withDefault();

const familiesEntityMock = [
  familyEntityFixture.withId("e53c1398-3572-4fe9-8cda-4fea303d9c5f").build(),
  familyEntityFixture.withId("4afbc5d5-40e7-40f7-b8e5-812a5c326aea").build(),
];

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any context",
});

// endregion mocks

// region spies
const userRepositorySpy = jest.mocked(repositoriesMocks.userRepository);
const familyRepositorySpy = jest.mocked(repositoriesMocks.familyRepository);

userRepositorySpy.getUser.mockResolvedValue(userEntityMock);
familyRepositorySpy.getFamilies.mockResolvedValue(familiesEntityMock);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getOwnersUseCase(repositoriesMocks).execute();
}

async function setupThrowable() {
  try {
    await setup();
  } catch (err) {
    return err;
  }
}

const spies = {
  familyRepository: familyRepositorySpy,
  userRepository: userRepositorySpy,
};

const mocks = {
  errors: {
    business: businessError,
    unknown: unknownError,
  },
  families: familiesEntityMock,
  user: userEntityMock,
};

export { mocks, setup, setupThrowable, spies };
