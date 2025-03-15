import { CacheStringKeys } from "@infrastructure/cache";

import {
  mocks,
  setup,
  spies,
} from "./mocks/familyMemberRepositoryImpl_createFamilyMember.mocks";

it("SHOULD create family member", async () => {
  await setup();

  expect(spies.createFamilyMember).toHaveBeenCalledTimes(1);
  expect(spies.createFamilyMember).toHaveBeenCalledWith({
    email: mocks.defaultProps.email,
    familyId: mocks.defaultProps.familyId,
    inviteToken: mocks.defaultProps.inviteToken,
    joinDate: mocks.defaultProps.joinDate,
    userId: mocks.defaultProps.userId,
  });
});

it("SHOULD invalidate cache", async () => {
  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith([
    CacheStringKeys.CACHE_FAMILIES_DATA,
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
  ]);
});
