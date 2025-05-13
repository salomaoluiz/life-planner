import { Datasources } from "@data/datasource";
import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { FamilyRepository } from "@domain/repositories/family";

import createFamily from "./createFamily";
import deleteFamily from "./deleteFamily";
import getFamilies from "./getFamilies";
import getFamilyById from "./getFamilyById";
import updateFamily from "./updateFamily";

function familyRepositoryImpl(datasources: Datasources): FamilyRepository {
  return {
    async createFamily(params): Promise<FamilyEntity> {
      return createFamily(params, datasources);
    },
    async deleteFamily(familyId: string): Promise<void> {
      return deleteFamily(familyId, datasources);
    },
    async getFamilies(userId: string): Promise<FamilyEntity[]> {
      return getFamilies(userId, datasources);
    },
    async getFamilyById(familyId: string): Promise<FamilyEntity> {
      return getFamilyById(familyId, datasources);
    },
    async updateFamily(params): Promise<void> {
      return updateFamily(params, datasources);
    },
  };
}

export default familyRepositoryImpl;
