import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache from "@infrastructure/cache";

import familyMemberRepositoryImpl from "../familyMemberRepositoryImpl";

// region mocks
const datasourceResponse = {
  inviteExpiresAt: "2026-10-11T12:00:00.000Z",
  inviteToken: "q3Jx0b9S2v1mA8kQ7rT4yU6pL5nW0zE3cF2hD1gB9aI",
};
// endregion mocks

// region spies
const inviteSpy = jest.spyOn(
  datasourcesMocks.familyMemberDatasource,
  "inviteFamilyMember",
);
const invalidateSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return familyMemberRepositoryImpl(datasourcesMocks).inviteFamilyMember({
    email: "test@example.com",
    familyId: "1234",
  });
}

const spies = { cache: { invalidate: invalidateSpy }, invite: inviteSpy };
const mocks = { datasourceResponse };

export { mocks, setup, spies };
