import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import FamilyInviteModel from "@data/models/familyMember/FamilyInviteModel";
import cache from "@infrastructure/cache";

import familyMemberRepositoryImpl from "../familyMemberRepositoryImpl";

// region mocks
const inviteModel = new FamilyInviteModel({
  email: "test@example.com",
  emailMatches: false,
  familyId: "family-1",
  familyName: "Test Family",
  inviteExpiresAt: "2026-10-11T12:00:00.000Z",
});
// endregion mocks

// region spies
const getInviteSpy = jest.spyOn(
  datasourcesMocks.familyMemberDatasource,
  "getInvite",
);
const cacheSpies = {
  get: jest.spyOn(cache, "get"),
  invalidate: jest.spyOn(cache, "invalidate"),
  set: jest.spyOn(cache, "set"),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return familyMemberRepositoryImpl(datasourcesMocks).getInvite("token");
}

const spies = { cache: cacheSpies, getInvite: getInviteSpy };
const mocks = { inviteModel };

export { mocks, setup, spies };
