import { repositoriesMocks } from "@data/repositories/mocks";
import * as crypto from "@infrastructure/crypto";

import createFamilyUseCase from "../createFamilyUseCase";

// region mocks
const userSuccessMock = {
  email: "test@gmail.com",
  id: "123",
};

const familySuccessMock = {
  id: "123",
};

const requestErrorMock = new Error("Request Error");
// endregion mocks

// region spies
const getUserSpy = jest.spyOn(repositoriesMocks.userRepository, "getUser");
const createFamilySpy = jest.spyOn(
  repositoriesMocks.familyRepository,
  "createFamily",
);
const createFamilyMemberSpy = jest.spyOn(
  repositoriesMocks.familyMemberRepository,
  "createFamilyMember",
);
const encodeSpy = jest.spyOn(crypto, "encode");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return createFamilyUseCase(repositoriesMocks).execute({ name: "New Family" });
}

async function throwableSetup() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}
const spies = {
  createFamily: createFamilySpy,
  createFamilyMember: createFamilyMemberSpy,
  encode: encodeSpy,
  getUser: getUserSpy,
};

const mocks = {
  familySuccess: familySuccessMock,
  requestError: requestErrorMock,
  userSuccess: userSuccessMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
