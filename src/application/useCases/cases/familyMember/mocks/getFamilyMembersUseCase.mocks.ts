import { repositoriesMocks } from "@data/repositories/mocks";
import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";

import getFamilyMembersUseCase from "../getFamilyMembersUseCase";

// region mocks
const familyMembersSuccessMock = [
  new FamilyMemberEntity({
    email: "test@gmail.com",
    familyId: "123",
    id: "222",
    joinedAt: new Date(),
    userId: "111",
  }),
];
// endregion mocks

// region spies
const getFamilyMembersSpy = jest.spyOn(
  repositoriesMocks.familyMemberRepository,
  "getFamilyMembers",
);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getFamilyMembersUseCase(repositoriesMocks).execute("123");
}

async function throwableSetup() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  getFamilyMembers: getFamilyMembersSpy,
};

const mocks = {
  familyMembersSuccess: familyMembersSuccessMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
