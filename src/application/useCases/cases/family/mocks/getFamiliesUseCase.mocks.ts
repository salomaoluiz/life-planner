import { repositoriesMocks } from "@data/repositories/mocks";
import { BusinessError } from "@domain/entities/errors";
import FamilyEntityFixture from "@domain/entities/family/mocks/FamilyEntity.fixture";
import UserEntityFixture from "@domain/entities/user/mocks/UserEntity.fixture";

import getFamiliesUseCase from "../getFamiliesUseCase";

// region mocks
const userEntity = new UserEntityFixture().withDefault().build();

const familyEntityFixture = new FamilyEntityFixture();
const familyEntities = [
  familyEntityFixture.withDefault().build(),
  familyEntityFixture.withId("52333496-8b2a-4142-b733-0990ea599c8c").build(),
];

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_context",
});
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getFamiliesUseCase(repositoriesMocks).execute();
}

async function throwableSetup() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  familyRepository: jest.mocked(repositoriesMocks.familyRepository),
  userRepository: jest.mocked(repositoriesMocks.userRepository),
};

const mocks = {
  errors: {
    business: businessError,
    unknown: unknownError,
  },
  familyEntities,
  userEntity,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
