import { CacheStringKeys } from "@infrastructure/cache";

import {
  mocks,
  setup,
  spies,
} from "./mocks/familyMemberRepositoryImpl_inviteFamilyMember.mocks";

it("SHOULD invite with email and familyId only AND return the token with a Date expiry", async () => {
  spies.invite.mockResolvedValueOnce(mocks.datasourceResponse);

  const result = await setup();

  expect(spies.invite).toHaveBeenCalledWith({
    email: "test@example.com",
    familyId: "1234",
  });
  expect(result).toEqual({
    inviteExpiresAt: new Date("2026-10-11T12:00:00.000Z"),
    inviteToken: mocks.datasourceResponse.inviteToken,
  });
});

it("SHOULD invalidate the cache once", async () => {
  spies.invite.mockResolvedValueOnce(mocks.datasourceResponse);

  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith([
    CacheStringKeys.CACHE_FAMILIES_DATA,
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
  ]);
});

it("SHOULD NOT invalidate the cache WHEN the datasource rejects", async () => {
  spies.invite.mockRejectedValueOnce(new Error("boom"));

  await expect(setup()).rejects.toThrow("boom");
  expect(spies.cache.invalidate).not.toHaveBeenCalled();
});
