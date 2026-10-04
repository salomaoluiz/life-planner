import { Datasources } from "@data/datasource";
import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";
import FamilyInviteEntity from "@domain/entities/familyMember/FamilyInviteEntity";
import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import { FamilyMemberRepository } from "@domain/repositories/familyMember/familyMemberRepository";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function familyMemberRepositoryImpl(
  datasources: Datasources,
): FamilyMemberRepository {
  return {
    async deleteFamilyMember(id: string): Promise<void> {
      try {
        await datasources.familyMemberDatasource.deleteFamilyMember(id);
      } finally {
        // Also on failure: a 404 means the cached list still shows a removed member.
        invalidateFamilyCache();
      }
    },
    async getFamilyMembers(familyId: string): Promise<FamilyMemberEntity[]> {
      const cachedModel = cache.get<Array<Record<string, unknown>> | null>(
        CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
        { uniqueId: familyId },
      );
      let familyMembersModel: FamilyMemberModel[] = [];

      if (cachedModel) {
        familyMembersModel = cachedModel.map((cached) =>
          FamilyMemberModel.fromJSON(cached),
        );
      } else {
        familyMembersModel =
          await datasources.familyMemberDatasource.getFamilyMembers(familyId);
        cache.set<Record<string, unknown>[]>(
          CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
          familyMembersModel.map((familyMember) => familyMember.toJSON()),
          { uniqueId: familyId },
        );
      }

      return familyMembersModel.map(toEntity);
    },
    async getInvite(inviteToken: string): Promise<FamilyInviteEntity> {
      const model =
        await datasources.familyMemberDatasource.getInvite(inviteToken);

      return new FamilyInviteEntity({
        email: model.email,
        emailMatches: model.emailMatches,
        familyId: model.familyId,
        familyName: model.familyName,
        inviteExpiresAt: new Date(model.inviteExpiresAt),
      });
    },
    async inviteFamilyMember(params) {
      const result =
        await datasources.familyMemberDatasource.inviteFamilyMember({
          email: params.email,
          familyId: params.familyId,
        });

      invalidateFamilyCache();

      return {
        inviteExpiresAt: new Date(result.inviteExpiresAt),
        inviteToken: result.inviteToken,
      };
    },
    async joinFamilyMember(params): Promise<void> {
      await datasources.familyMemberDatasource.joinFamilyMember({
        inviteToken: params.inviteToken,
      });

      invalidateFamilyCache();
    },
  };
}

function invalidateFamilyCache() {
  cache.invalidate([
    CacheStringKeys.CACHE_FAMILIES_DATA,
    CacheStringKeys.CACHE_FAMILY_MEMBERS_DATA,
  ]);
}

function toEntity(model: FamilyMemberModel) {
  return new FamilyMemberEntity({
    email: model.email,
    familyId: model.familyId,
    id: model.id,
    inviteExpired: model.inviteExpired,
    joinedAt: model.joinedAt ? new Date(model.joinedAt) : undefined,
    name: model.user?.name,
    photoUrl: model.user?.photoUrl,
    role: model.role as FamilyMemberRole,
    status: model.status as FamilyMemberStatus,
    userId: model.userId,
  });
}

export default familyMemberRepositoryImpl;
