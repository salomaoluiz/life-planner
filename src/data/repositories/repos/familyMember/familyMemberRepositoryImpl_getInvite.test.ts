import FamilyInviteEntity from "@domain/entities/familyMember/FamilyInviteEntity";

import {
  mocks,
  setup,
  spies,
} from "./mocks/familyMemberRepositoryImpl_getInvite.mocks";

it("SHOULD return a FamilyInviteEntity with a Date expiry", async () => {
  spies.getInvite.mockResolvedValueOnce(mocks.inviteModel);

  const result = await setup();

  expect(spies.getInvite).toHaveBeenCalledWith("token");
  expect(result).toBeInstanceOf(FamilyInviteEntity);
  expect(result).toEqual({
    email: "test@example.com",
    emailMatches: false,
    familyId: "family-1",
    familyName: "Test Family",
    inviteExpiresAt: new Date("2026-10-11T12:00:00.000Z"),
  });
});

it("SHOULD NOT touch the cache", async () => {
  spies.getInvite.mockResolvedValueOnce(mocks.inviteModel);

  await setup();

  expect(spies.cache.get).not.toHaveBeenCalled();
  expect(spies.cache.set).not.toHaveBeenCalled();
  expect(spies.cache.invalidate).not.toHaveBeenCalled();
});
