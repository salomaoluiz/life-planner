import { repositoriesMocks } from "@data/repositories/mocks";

import deleteFamilyUseCase from "../deleteFamilyUseCase";

// region mocks

// endregion mocks

// region spies
const deleteFamilySpy = jest.spyOn(
  repositoriesMocks.familyRepository,
  "deleteFamily",
);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return deleteFamilyUseCase(repositoriesMocks).execute({ id: "123" });
}

async function throwableSetup() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}
const spies = {
  deleteFamily: deleteFamilySpy,
};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
