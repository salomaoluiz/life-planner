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
      const cached = cache.get<Array<Record<string, unknown>> | null>(
        CacheStringKeys.CACHE_FAMILIES_DATA,
      );

      let familiesModel: FamilyModel[] = [];

      if (cached) {
        familiesModel = cached.map((cache) => FamilyModel.fromJSON(cache));
      } else {
        familiesModel = await datasources.familyDatasource.getFamilies(userId);
        cache.set<Record<string, unknown>[]>(
          CacheStringKeys.CACHE_FAMILIES_DATA,
          familiesModel.map((family) => family.toJSON()),
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
    async getFamilyById(familyId: string): Promise<FamilyEntity> {
      const cached = cache.get<null | Record<string, unknown>>(
        CacheStringKeys.CACHE_FAMILIES_DATA,
        {
          uniqueId: familyId,
        },
      );
      let familyModel: FamilyModel | undefined;

      if (cached) {
        familyModel = FamilyModel.fromJSON(cached);
      } else {
        familyModel =
          await datasources.familyDatasource.getFamilyById(familyId);
        cache.set<Record<string, unknown>>(
          CacheStringKeys.CACHE_FAMILIES_DATA,
          familyModel.toJSON(),
          { uniqueId: familyId },
        );
      }

      return new FamilyEntity({
        id: familyModel.id,
        name: familyModel.name,
        ownerId: familyModel.ownerId,
      });
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
