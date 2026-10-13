import { CacheStringKeys } from "@infrastructure/cache";

import {
  setup,
  spies,
} from "./mocks/familyMemberRepositoryImpl_deleteFamilyMember.mocks";

it("SHOULD delete family member", async () => {
  await setup();

  expect(spies.deleteFamilyMember).toHaveBeenCalledTimes(1);
  expect(spies.deleteFamilyMember).toHaveBeenCalledWith("1234");
});

it("SHOULD invalidate cache", async () => {
  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith([
    CacheStringKeys.CACHE_FAMILIES_DATA,
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
  ]);
});

it("SHOULD invalidate cache even WHEN the datasource rejects (member already gone: the cached list is stale)", async () => {
  spies.deleteFamilyMember.mockRejectedValueOnce(new Error("not found"));

  await expect(setup()).rejects.toThrow("not found");

  expect(spies.cache.invalidate).toHaveBeenCalledWith([
    CacheStringKeys.CACHE_FAMILIES_DATA,
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
  ]);
});
