import { repositoriesMocks } from "@data/repositories/mocks";
import * as crypto from "@infrastructure/crypto";

import inviteFamilyMemberUseCase from "../inviteFamilyMemberUseCase";

// region mocks

// endregion mocks

// region spies
const createFamilyMemberSpy = jest.spyOn(
  repositoriesMocks.familyMemberRepository,
  "createFamilyMember",
);
const encodeSpy = jest
  .spyOn(crypto, "encode")
  .mockResolvedValue("encoded-token");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return inviteFamilyMemberUseCase(repositoriesMocks).execute({
    email: "test@gmail.com",
    familyId: "123",
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
  createFamilyMember: createFamilyMemberSpy,
  encode: encodeSpy,
};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
