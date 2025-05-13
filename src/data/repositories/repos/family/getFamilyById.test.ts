import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/getFamilyById.mocks";

it("SHOULD return families from cache", async () => {
  spies.cache.get.mockReturnValue(mocks.family.toJSON());

  const result = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
    { uniqueId: mocks.defaultParams },
  );
  expect(result).toEqual(
    new FamilyEntity({
      id: mocks.family.id,
      name: mocks.family.name,
      ownerId: mocks.family.ownerId,
    }),
  );
});

it("SHOULD NOT call cache.set and datasource if has cached data", async () => {
  spies.cache.get.mockReturnValue(mocks.family.toJSON());

  await setup();

  expect(spies.cache.set).not.toHaveBeenCalled();
  expect(spies.familyDatasource.getFamilyById).not.toHaveBeenCalled();
});

it("SHOULD call cache.set and datasource if has no cached data", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.familyDatasource.getFamilyById.mockResolvedValueOnce(mocks.family);

  await setup();

  expect(spies.cache.set).toHaveBeenCalledTimes(1);
  expect(spies.cache.set).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
    mocks.family.toJSON(),
    { uniqueId: mocks.defaultParams },
  );
  expect(spies.familyDatasource.getFamilyById).toHaveBeenCalledTimes(1);
  expect(spies.familyDatasource.getFamilyById).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
});

it("SHOULD return families from datasource", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.familyDatasource.getFamilyById.mockResolvedValueOnce(mocks.family);

  const result = await setup();

  expect(result).toEqual(
    new FamilyEntity({
      id: mocks.family.id,
      name: mocks.family.name,
      ownerId: mocks.family.ownerId,
    }),
  );
});
