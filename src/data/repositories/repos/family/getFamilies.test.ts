import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/getFamilies.mocks";

it("SHOULD NOT call cache.set and datasource if has cached data", async () => {
  spies.cache.get.mockReturnValue([mocks.firstFamily.toJSON()]);

  await setup();

  expect(spies.cache.set).not.toHaveBeenCalled();
  expect(spies.familyDatasource.getFamilies).not.toHaveBeenCalled();
});

it("SHOULD return families from cache", async () => {
  spies.cache.get.mockReturnValue([mocks.firstFamily.toJSON()]);

  const result = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
  );
  expect(result).toEqual([
    new FamilyEntity({
      id: mocks.firstFamily.id,
      name: mocks.firstFamily.name,
      ownerId: mocks.firstFamily.ownerId,
    }),
  ]);
});

it("SHOULD call cache.set and datasource if has no cached data", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.familyDatasource.getFamilies.mockResolvedValueOnce([
    mocks.firstFamily,
    mocks.secondFamily,
  ]);

  await setup();

  expect(spies.cache.set).toHaveBeenCalledTimes(1);
  expect(spies.cache.set).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
    [mocks.firstFamily.toJSON(), mocks.secondFamily.toJSON()],
  );
  expect(spies.familyDatasource.getFamilies).toHaveBeenCalledTimes(1);
  expect(spies.familyDatasource.getFamilies).toHaveBeenCalledWith(
    mocks.defaultParams,
  );
});

it("SHOULD return families from datasource", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.familyDatasource.getFamilies.mockResolvedValueOnce([
    mocks.secondFamily,
  ]);

  const result = await setup();

  expect(result).toEqual([
    new FamilyEntity({
      id: mocks.secondFamily.id,
      name: mocks.secondFamily.name,
      ownerId: mocks.secondFamily.ownerId,
    }),
  ]);
});
