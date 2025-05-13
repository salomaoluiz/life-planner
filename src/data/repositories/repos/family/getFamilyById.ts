import { Datasources } from "@data/datasource";
import FamilyModel from "@data/models/family/FamilyModel";
import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { FamilyRepository } from "@domain/repositories/family";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<FamilyRepository["getFamilyById"]>[0];
export type Response = ReturnType<FamilyRepository["getFamilyById"]>;

async function getFamilyById(
  familyId: Params,
  datasources: Datasources,
): Response {
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
    familyModel = await datasources.familyDatasource.getFamilyById(familyId);
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
}

export default getFamilyById;
