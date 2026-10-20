import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { FamilyStatus } from "@domain/entities/family/FamilyStatus";

export type FamilyRepository = {
  createFamily(params: CreateFamilyRepositoryParams): Promise<FamilyEntity>;
  deleteFamily(id: string): Promise<void>;
  getFamilies(userId: string): Promise<FamilyEntity[]>;
  getFamilyById(familyId: string): Promise<FamilyEntity>;
  updateFamily(params: UpdateFamilyRepositoryParams): Promise<void>;
};

interface CreateFamilyRepositoryParams {
  name: string;
  ownerId: string;
}

interface UpdateFamilyRepositoryParams {
  id: string;
  name?: string;
  status?: FamilyStatus;
}

export { CreateFamilyRepositoryParams, UpdateFamilyRepositoryParams };
