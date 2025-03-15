import { repositoriesMocks } from "@data/repositories/mocks";
import * as crypto from "@infrastructure/crypto";

import joinFamilyMemberUseCase from "../joinFamilyMemberUseCase";

// region mocks
const userSuccessMock = {
  id: "123",
};
// endregion mocks

// region spies
const getUserSpy = jest.spyOn(repositoriesMocks.userRepository, "getUser");
const joinFamilyMemberSpy = jest.spyOn(
  repositoriesMocks.familyMemberRepository,
  "joinFamilyMember",
);
const encodeSpy = jest
  .spyOn(crypto, "encode")
  .mockResolvedValue("encoded-token");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return joinFamilyMemberUseCase(repositoriesMocks).execute({
    inviteToken: "encoded-token",
  });
}

async function throwableSetup() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}
const spies = {
  encode: encodeSpy,
  getUser: getUserSpy,
  joinFamilyMember: joinFamilyMemberSpy,
};

const mocks = {
  userSuccess: userSuccessMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
