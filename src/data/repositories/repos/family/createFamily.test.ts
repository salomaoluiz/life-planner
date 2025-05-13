import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import { mocks, setup, spies } from "./mocks/createFamily.mocks";

it("SHOULD create a family", async () => {
  await setup();

  expect(spies.familyDatasource.createFamily).toHaveBeenCalledWith({
    name: mocks.defaultParams.name,
    ownerId: mocks.defaultParams.ownerId,
  });
});

it("SHOULD return a family created", async () => {
  const result = await setup();

  expect(result).toEqual(
    new FamilyEntity({
      id: mocks.familyModel.id,
      name: mocks.familyModel.name,
      ownerId: mocks.familyModel.ownerId,
    }),
  );
});

it("SHOULD invalidate cache after family created", async () => {
  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
  );
});
