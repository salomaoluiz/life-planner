import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

import joinFamilyMemberUseCase from "../joinFamilyMemberUseCase";

// region mocks
const validToken = "q3Jx0b9S2v1mA8kQ7rT4yU6pL5nW0zE3cF2hD1gB9aI";
// endregion mocks

// region spies
const joinFamilyMemberSpy = jest.spyOn(
  repositoriesMocks.familyMemberRepository,
  "joinFamilyMember",
);
const getUserSpy = jest.spyOn(repositoriesMocks.userRepository, "getUser");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(inviteToken: unknown = validToken) {
  return joinFamilyMemberUseCase(repositoriesMocks).execute({
    inviteToken: inviteToken as string,
  });
}

async function throwableSetup(inviteToken?: unknown) {
  try {
    await setup(inviteToken);
  } catch (error) {
    return error;
  }
}

const spies = { getUser: getUserSpy, joinFamilyMember: joinFamilyMemberSpy };
const mocks = { validToken };

export { mocks, setup, spies, throwableSetup };
