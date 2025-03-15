import { CacheStringKeys } from "@infrastructure/cache";

import {
  mocks,
  setup,
  spies,
} from "./mocks/familyMemberRepositoryImpl_joinFamilyMember.mocks";

it("SHOULD join family member", async () => {
  await setup();

  expect(spies.joinFamilyMember).toHaveBeenCalledTimes(1);
  expect(spies.joinFamilyMember).toHaveBeenCalledWith(mocks.defaultProps);
});

it("SHOULD invalidate cache", async () => {
  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith([
    CacheStringKeys.CACHE_FAMILIES_DATA,
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
  ]);
});
