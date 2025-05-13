import { Datasources } from "@data/datasource";
import { FamilyRepository } from "@domain/repositories/family";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<FamilyRepository["updateFamily"]>[0];
export type Response = ReturnType<FamilyRepository["updateFamily"]>;

async function updateFamily(
  params: Params,
  datasources: Datasources,
): Response {
  await datasources.familyDatasource.updateFamily({
    id: params.id,
    name: params.name,
  });

  cache.invalidate(CacheStringKeys.CACHE_FAMILIES_DATA);
}

export default updateFamily;
