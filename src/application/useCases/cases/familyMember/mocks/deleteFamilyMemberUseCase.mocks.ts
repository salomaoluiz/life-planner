import { repositoriesMocks } from "@data/repositories/mocks";

import deleteFamilyMemberUseCase from "../deleteFamilyMemberUseCase";

// region mocks

// endregion mocks

// region spies
const deleteFamilyMemberSpy = jest.spyOn(
  repositoriesMocks.familyMemberRepository,
  "deleteFamilyMember",
);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return deleteFamilyMemberUseCase(repositoriesMocks).execute({ id: "123" });
}

async function throwableSetup() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}
const spies = {
  deleteFamilyMember: deleteFamilyMemberSpy,
};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
