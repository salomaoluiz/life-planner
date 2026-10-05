import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import FamilyInviteEntity from "@domain/entities/familyMember/FamilyInviteEntity";

import getFamilyInviteUseCase from "../getFamilyInviteUseCase";

// region mocks
const validToken = "q3Jx0b9S2v1mA8kQ7rT4yU6pL5nW0zE3cF2hD1gB9aI";
const inviteEntity = new FamilyInviteEntity({
  email: "test@example.com",
  emailMatches: true,
  familyId: "123",
  familyName: "Test Family",
  inviteExpiresAt: new Date("2026-10-11T12:00:00.000Z"),
});
// endregion mocks

// region spies
const getInviteSpy = jest.spyOn(
  repositoriesMocks.familyMemberRepository,
  "getInvite",
);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(token: unknown = validToken) {
  return getFamilyInviteUseCase(repositoriesMocks).execute(token as string);
}

async function throwableSetup(token?: unknown) {
  try {
    await setup(token);
  } catch (error) {
    return error;
  }
}

const spies = { getInvite: getInviteSpy };
const mocks = { inviteEntity, validToken };

export { mocks, setup, spies, throwableSetup };
