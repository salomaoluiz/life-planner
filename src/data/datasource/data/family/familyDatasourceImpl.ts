import FamilyModel from "@data/models/family/FamilyModel";
import { FamilyDatasource } from "@data/repositories/repos/family/familyDatasource";
import {
  BusinessError,
  FamilyNotFound,
  GenericError,
} from "@domain/entities/errors";
import FamilyNotCreated from "@domain/entities/errors/family/FamilyNotCreated";
import { supabase } from "@infrastructure/supabase";

function familyDatasourceImpl(): FamilyDatasource {
  return {
    async createFamily(params): Promise<FamilyModel> {
      try {
        const response = await supabase
          .from("family")
          .upsert({
            family_name: params.name,
            owner_id: params.ownerId,
          })
          .select()
          .then();

        if (response.error || !response.data) {
          throw new FamilyNotCreated();
        }

        return FamilyModel.fromJSON(response.data[0]);
      } catch (error) {
        const genericError = new GenericError();
        genericError.addContext({
          error,
          params,
        });

        throw genericError;
      }
    },
    async deleteFamily(id: string): Promise<void> {
      try {
        await supabase.from("family").delete().eq("id", id).then();
      } catch (error) {
        const genericError = new GenericError();
        genericError.addContext({
          error,
          id,
        });
        throw genericError;
      }
    },
    async getFamilies(userId: string): Promise<FamilyModel[]> {
      try {
        const familyMembers = await supabase
          .from("family-member")
          .select("user_id, family_id")
          .eq("user_id", userId)
          .then();

        const ids = familyMembers.data?.map(({ family_id }) => family_id);

        if (!ids || ids.length === 0) {
          return [];
        }

        const families = await supabase
          .from("family")
          .select()
          .in("id", ids)
          .then();

        if (!families.data) {
          const error = new FamilyNotFound();
          error.addContext({ ids });
          throw error;
        }

        return families.data.map<FamilyModel>(
          (family) =>
            new FamilyModel({
              id: family.id,
              name: family.family_name,
              ownerId: family.owner_id,
            }),
        );
      } catch (error) {
        if (error instanceof BusinessError) {
          throw error;
        }
        const genericError = new GenericError();
        genericError.addContext({ error, userId });
        throw genericError;
      }
    },
    async updateFamily(params): Promise<void> {
      try {
        await supabase
          .from("family")
          .update({
            family_name: params.name,
          })
          .eq("id", params.id)
          .then();
      } catch (error) {
        const genericError = new GenericError();
        genericError.addContext({
          error,
          params: params,
        });
        throw genericError;
      }
    },
  };
}

export default familyDatasourceImpl;
