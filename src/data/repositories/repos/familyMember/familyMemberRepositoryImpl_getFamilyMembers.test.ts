import { CacheStringKeys } from "@infrastructure/cache";

import {
  mocks,
  setup,
  spies,
} from "./mocks/familyMemberRepositoryImpl_getFamilyMembers.mocks";

it("SHOULD get family members from cache WHEN cache is not empty (new JSON shape round-trips)", async () => {
  spies.cache.get.mockReturnValueOnce(mocks.getFamilyMembersSuccessCacheMock);

  const familyMembers = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
    { uniqueId: "1234" },
  );
  expect(spies.getFamilyMembers).not.toHaveBeenCalled();
  expect(spies.cache.set).not.toHaveBeenCalled();
  expect(familyMembers).toEqual(mocks.expectedEntities);
});

it("SHOULD get family members from datasource and set cache WHEN cache is empty", async () => {
  spies.cache.get.mockReturnValueOnce(null);
  spies.getFamilyMembers.mockResolvedValueOnce(
    mocks.getFamilyMembersSuccessMock,
  );

  const familyMembers = await setup();

  expect(spies.getFamilyMembers).toHaveBeenCalledTimes(1);
  expect(spies.getFamilyMembers).toHaveBeenCalledWith("1234");
  expect(spies.cache.set).toHaveBeenCalledTimes(1);
  expect(spies.cache.set).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
    mocks.getFamilyMembersSuccessCacheMock,
    { uniqueId: "1234" },
  );
  expect(familyMembers).toEqual(mocks.expectedEntities);
});

it("SHOULD map name/photoUrl from the user AND leave them undefined for a pending member", async () => {
  spies.cache.get.mockReturnValueOnce(null);
  spies.getFamilyMembers.mockResolvedValueOnce(
    mocks.getFamilyMembersSuccessMock,
  );

  const [joined, pending] = await setup();

  expect(joined.name).toBe("Test Owner");
  expect(joined.photoUrl).toBe("https://example.test/o.png");
  expect(pending.name).toBeUndefined();
  expect(pending.photoUrl).toBeUndefined();
  expect(pending.joinedAt).toBeUndefined();
  expect(pending.userId).toBeUndefined();
});
