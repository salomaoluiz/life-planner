import FamilyDTO from "@application/dto/family/FamilyDTO";
import { repositoriesMocks } from "@data/repositories/mocks";

import getFamiliesUseCase from "../getFamiliesUseCase";

// region mocks
const userSuccessMock = {
  email: "test@gmail.com",
  id: "123",
};

const familiesSuccessMock = [
  new FamilyDTO({
    id: "123",
    name: "Family 1",
    ownerId: "123",
  }),
];

// endregion mocks

// region spies
const getUserSpy = jest.spyOn(repositoriesMocks.userRepository, "getUser");
const getFamiliesSpy = jest.spyOn(
  repositoriesMocks.familyRepository,
  "getFamilies",
);

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
  getFamilies: getFamiliesSpy,
  getUser: getUserSpy,
};

const mocks = {
  familiesSuccess: familiesSuccessMock,
  userSuccess: userSuccessMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
