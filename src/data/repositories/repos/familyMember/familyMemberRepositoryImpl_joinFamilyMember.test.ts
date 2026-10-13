import { CacheStringKeys } from "@infrastructure/cache";

import {
  mocks,
  setup,
  spies,
} from "./mocks/familyMemberRepositoryImpl_joinFamilyMember.mocks";

it("SHOULD join with the token only", async () => {
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

it("SHOULD NOT invalidate cache WHEN the datasource rejects", async () => {
  spies.joinFamilyMember.mockRejectedValueOnce(new Error("boom"));

  await expect(setup()).rejects.toThrow("boom");
  expect(spies.cache.invalidate).not.toHaveBeenCalled();
});
