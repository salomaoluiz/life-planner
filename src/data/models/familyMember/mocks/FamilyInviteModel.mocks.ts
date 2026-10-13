import FamilyInviteModel from "../FamilyInviteModel";

const jsonMock = {
  email: "test@example.com",
  emailMatches: true,
  familyId: "family-1",
  familyName: "Test Family",
  inviteExpiresAt: "2026-10-11T12:00:00.000Z",
};

function setup() {
  return FamilyInviteModel.fromJSON(jsonMock);
}

const spies = {};
const mocks = { json: jsonMock };

export { mocks, setup, spies };
