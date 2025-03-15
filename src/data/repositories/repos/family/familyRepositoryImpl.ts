import { Datasources } from "@data/datasource";
import FamilyModel from "@data/models/family/FamilyModel";
import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { FamilyRepository } from "@domain/repositories/family";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function familyRepositoryImpl(datasources: Datasources): FamilyRepository {
  return {
    async createFamily(params): Promise<FamilyEntity> {
      const family = await datasources.familyDatasource.createFamily({
        name: params.name,
        ownerId: params.ownerId,
      });

      cache.invalidate(CacheStringKeys.CACHE_FAMILIES_DATA);

      return new FamilyEntity({
        id: family.id,
        name: family.name,
        ownerId: family.ownerId,
      });
    },
    async deleteFamily(familyId: string): Promise<void> {
      await datasources.familyDatasource.deleteFamily(familyId);

      cache.invalidate(CacheStringKeys.CACHE_FAMILIES_DATA);
    },
    async getFamilies(userId: string): Promise<FamilyEntity[]> {
      let familiesModel = cache.get<FamilyModel[]>(
        CacheStringKeys.CACHE_FAMILIES_DATA,
      );

      if (!familiesModel) {
        familiesModel = await datasources.familyDatasource.getFamilies(userId);
        cache.set<FamilyModel[]>(
          CacheStringKeys.CACHE_FAMILIES_DATA,
          familiesModel,
        );
      }

      return familiesModel.map(
        (family) =>
          new FamilyEntity({
            id: family.id,
            name: family.name,
            ownerId: family.ownerId,
          }),
      );
    },
    async updateFamily(params): Promise<void> {
      await datasources.familyDatasource.updateFamily({
        id: params.id,
        name: params.name,
      });

      cache.invalidate(CacheStringKeys.CACHE_FAMILIES_DATA);
    },
  };
}

export default familyRepositoryImpl;
