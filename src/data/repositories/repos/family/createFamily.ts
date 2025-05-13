import { Datasources } from "@data/datasource";
import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { FamilyRepository } from "@domain/repositories/family";
import cache, { CacheStringKeys } from "@infrastructure/cache";

export type Params = Parameters<FamilyRepository["createFamily"]>[0];
export type Response = ReturnType<FamilyRepository["createFamily"]>;

async function createFamily(
  params: Params,
  datasources: Datasources,
): Response {
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
}

export default createFamily;
