import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";
import { FamilyMemberDatasource } from "@data/repositories/repos/familyMember/familyMemberDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

function familyMemberDatasourceImpl(): FamilyMemberDatasource {
  return {
    async createFamilyMember(params): Promise<void> {
      try {
        await supabase
          .from("family-member")
          .insert({
            email: params.email,
            family_id: params.familyId,
            invite_token: params.inviteToken,
            join_date: params.joinDate,
            user_id: params.userId,
          })
          .then();
      } catch (err) {
        const genericError = new GenericError();
        genericError.addContext({
          error: err,
          params,
        });
        throw genericError;
      }
    },
    async deleteFamilyMember(id: string): Promise<void> {
      try {
        await supabase.from("family-member").delete().eq("id", id).then();
      } catch (error) {
        const genericError = new GenericError();
        genericError.addContext({
          error,
          id,
        });
        throw genericError;
      }
    },
    async getFamilyMembers(familyId: string): Promise<FamilyMemberModel[]> {
      try {
        const response = await supabase
          .from("family-member")
          .select()
          .eq("family_id", familyId)
          .then();

        const familyMembers = response.data?.map((familyMember) =>
          FamilyMemberModel.fromJSON(familyMember),
        );

        return familyMembers ?? [];
      } catch (error) {
        const genericError = new GenericError();
        genericError.addContext({
          error,
          familyId,
        });
        throw genericError;
      }
    },
    async joinFamilyMember(params): Promise<void> {
      try {
        await supabase
          .from("family-member")
          .update({
            join_date: params.joinDate,
            user_id: params.userId,
          })
          .eq("invite_token", params.inviteToken)
          .then();
      } catch (error) {
        const genericError = new GenericError();
        genericError.addContext({
          error,
          params,
        });
        throw genericError;
      }
    },
  };
}

export default familyMemberDatasourceImpl;
