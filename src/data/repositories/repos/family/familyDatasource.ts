import FamilyModel from "@data/models/family/FamilyModel";

export interface FamilyDatasource {
  createFamily(params: CreateFamilyDatasourceParams): Promise<FamilyModel>;
  deleteFamily(id: string): Promise<void>;
  getFamilies(userId: string): Promise<FamilyModel[]>;
  getFamilyById(familyId: string): Promise<FamilyModel>;
  updateFamily(params: UpdateFamilyDatasourceParams): Promise<void>;
}

interface CreateFamilyDatasourceParams {
  name: string;
  ownerId: string;
}

interface UpdateFamilyDatasourceParams {
  id: string;
  name: string;
}

export { CreateFamilyDatasourceParams, UpdateFamilyDatasourceParams };
