import { Datasources } from "@data/datasource";
import { FamilyRepository } from "@domain/repositories/family";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<FamilyRepository["deleteFamily"]>[0];
export type Response = ReturnType<FamilyRepository["deleteFamily"]>;

async function deleteFamily(
  familyId: Params,
  datasources: Datasources,
): Response {
  await datasources.familyDatasource.deleteFamily(familyId);

  cache.invalidate(CacheStringKeys.CACHE_FAMILIES_DATA);
}

export default deleteFamily;
