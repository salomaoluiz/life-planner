import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import {
  mocks,
  setup,
  spies,
} from "./mocks/familyMemberRepositoryImpl_getFamilyMembers.mocks";

it("SHOULD get family members from cache WHEN cache is not empty", async () => {
  spies.cache.get.mockReturnValue(mocks.getFamilyMembersSuccessMock);

  const familyMembers = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
  );
  expect(spies.getFamilyMembers).not.toHaveBeenCalled();
  expect(spies.cache.set).not.toHaveBeenCalled();

  expect(familyMembers).toEqual(
    mocks.getFamilyMembersSuccessMock.map(
      (familyMember) =>
        new FamilyMemberEntity({
          email: familyMember.email,
          familyId: familyMember.familyId,
          id: familyMember.id,
          joinedAt: familyMember.joinDate
            ? new Date(familyMember.joinDate)
            : undefined,
          userId: familyMember.userId,
        }),
    ),
  );
});

it("SHOULD get family members from datasource and set cache WHEN cache is empty", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.getFamilyMembers.mockReturnValue(mocks.getFamilyMembersSuccessMock);

  const familyMembers = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
  );
  expect(spies.getFamilyMembers).toHaveBeenCalledTimes(1);
  expect(spies.getFamilyMembers).toHaveBeenCalledWith("1234");
  expect(spies.cache.set).toHaveBeenCalledTimes(1);
  expect(spies.cache.set).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
    mocks.getFamilyMembersSuccessMock,
  );

  expect(familyMembers).toEqual(
    mocks.getFamilyMembersSuccessMock.map(
      (familyMember) =>
        new FamilyMemberEntity({
          email: familyMember.email,
          familyId: familyMember.familyId,
          id: familyMember.id,
          joinedAt: familyMember.joinDate
            ? new Date(familyMember.joinDate)
            : undefined,
          userId: familyMember.userId,
        }),
    ),
  );
});
