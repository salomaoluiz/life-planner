import { Datasources } from "@data/datasource";
import FamilyModel from "@data/models/family/FamilyModel";
import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { FamilyRepository } from "@domain/repositories/family";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<FamilyRepository["getFamilies"]>[0];
export type Response = ReturnType<FamilyRepository["getFamilies"]>;

async function getFamilies(userId: Params, datasources: Datasources): Response {
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
}

export default getFamilies;
