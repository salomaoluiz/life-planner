import FamilyEntity from "@domain/entities/family/FamilyEntity";

export type FamilyRepository = {
  createFamily(params: CreateFamilyRepositoryParams): Promise<FamilyEntity>;
  deleteFamily(id: string): Promise<void>;
  getFamilies(userId: string): Promise<FamilyEntity[]>;
  updateFamily(params: UpdateFamilyRepositoryParams): Promise<void>;
};

interface CreateFamilyRepositoryParams {
  name: string;
  ownerId: string;
}

interface UpdateFamilyRepositoryParams {
  id: string;
  name?: string;
}
