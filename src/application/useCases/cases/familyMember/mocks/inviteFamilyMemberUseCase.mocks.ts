import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

import inviteFamilyMemberUseCase from "../inviteFamilyMemberUseCase";

// region mocks
const inviteResponseMock = {
  inviteExpiresAt: new Date("2026-10-11T12:00:00.000Z"),
  inviteToken: "q3Jx0b9S2v1mA8kQ7rT4yU6pL5nW0zE3cF2hD1gB9aI",
};
// endregion mocks

// region spies
const inviteFamilyMemberSpy = jest.spyOn(
  repositoriesMocks.familyMemberRepository,
  "inviteFamilyMember",
);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(email = "test@example.com") {
  return inviteFamilyMemberUseCase(repositoriesMocks).execute({
    email,
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

const spies = { inviteFamilyMember: inviteFamilyMemberSpy };
const mocks = { inviteResponse: inviteResponseMock };

export { mocks, setup, spies, throwableSetup };
