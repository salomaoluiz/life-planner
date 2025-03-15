import { Datasources } from "@data/datasource";
import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";
import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";
import { FamilyMemberRepository } from "@domain/repositories/familyMember/familyMemberRepository";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function familyMemberRepositoryImpl(
  datasources: Datasources,
): FamilyMemberRepository {
  return {
    async createFamilyMember(params): Promise<void> {
      await datasources.familyMemberDatasource.createFamilyMember({
        email: params.email,
        familyId: params.familyId,
        inviteToken: params.inviteToken,
        joinDate: params.joinDate,
        userId: params.userId,
      });

      cache.invalidate([
        CacheStringKeys.CACHE_FAMILIES_DATA,
        CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
      ]);
    },
    async deleteFamilyMember(id: string): Promise<void> {
      await datasources.familyMemberDatasource.deleteFamilyMember(id);

      cache.invalidate([
        CacheStringKeys.CACHE_FAMILIES_DATA,
        CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
      ]);
    },
    async getFamilyMembers(familyId: string): Promise<FamilyMemberEntity[]> {
      let familyMembersModel = cache.get<FamilyMemberModel[]>(
        CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
      );
      if (!familyMembersModel) {
        familyMembersModel =
          await datasources.familyMemberDatasource.getFamilyMembers(familyId);
        cache.set<FamilyMemberModel[]>(
          CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
          familyMembersModel,
        );
      }

      return familyMembersModel.map(
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
      );
    },
    async joinFamilyMember(params): Promise<void> {
      await datasources.familyMemberDatasource.joinFamilyMember({
        inviteToken: params.inviteToken,
        joinDate: params.joinDate,
        userId: params.userId,
      });

      cache.invalidate([
        CacheStringKeys.CACHE_FAMILIES_DATA,
        CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
      ]);
    },
  };
}

export default familyMemberRepositoryImpl;
